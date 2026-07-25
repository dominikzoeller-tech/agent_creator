const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const root = process.cwd();
const taskPath = path.join(root, 'tasks/next-task.json');
const resultPath = path.join(root, 'tasks/last-result.json');
const logPath = path.join(root, 'logs/last-agent-worker.log');

const ALLOW = new Set([
  'git status --short',
  'npm run build',
  'npm --prefix frontend run build',
  'npm --prefix frontend run dev',
  'npm run worker1:verify'
]);

function appendLog(text) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, text + '\n', 'utf8');
}

function writeResult(result) {
  fs.mkdirSync(path.dirname(resultPath), { recursive: true });
  fs.writeFileSync(resultPath, JSON.stringify({ ...result, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

function runCommand(command) {
  if (!ALLOW.has(command)) {
    appendLog('[blocked] ' + command);
    return { command, ok: false, code: -1, blocked: true, stdout: '', stderr: 'Command not allowed' };
  }
  appendLog('[run] ' + command);
  const result = spawnSync(command, { shell: true, cwd: root, encoding: 'utf8', timeout: 120000 });
  appendLog('[exit] ' + result.status);
  if (result.stdout) appendLog('[stdout]\n' + result.stdout);
  if (result.stderr) appendLog('[stderr]\n' + result.stderr);
  return { command, ok: result.status === 0, code: result.status, blocked: false, stdout: result.stdout || '', stderr: result.stderr || '' };
}

async function main() {
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'logs'), { recursive: true });

  if (!fs.existsSync(taskPath)) {
    writeResult({ ok: false, message: 'tasks/next-task.json fehlt.' });
    console.error('[missing] tasks/next-task.json');
    process.exit(1);
  }

  fs.writeFileSync(logPath, '[agent-worker] started ' + new Date().toISOString() + '\n', 'utf8');
  const task = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
  const commands = Array.isArray(task.allowedCommands) ? task.allowedCommands : [];

  console.log('Agent Worker Task:');
  console.log('Title:', task.title || '(no title)');
  console.log('Goal:', task.goal || '(no goal)');
  console.log('Commands:');
  for (const command of commands) console.log(' - ' + command);

  const answer = await ask('Execute allowed commands? y/N: ');
  if (String(answer).toLowerCase() !== 'y') {
    writeResult({ ok: false, cancelled: true, message: 'Worker-Lauf vom Nutzer abgebrochen.', task });
    console.log('[cancelled]');
    return;
  }

  const results = [];
  for (const command of commands) results.push(runCommand(command));
  const ok = results.every((item) => item.ok);
  writeResult({ ok, message: ok ? 'Alle Commands erfolgreich.' : 'Mindestens ein Command fehlgeschlagen oder blockiert.', task, results, logPath: 'logs/last-agent-worker.log' });
  console.log(ok ? '[OK] worker done' : '[FAIL] worker done');
}

main().catch((error) => {
  appendLog('[fatal] ' + (error && error.stack ? error.stack : String(error)));
  writeResult({ ok: false, message: 'Worker fatal error', error: String(error) });
  process.exit(1);
});
