const fs = require('fs');
const path = require('path');
const root = process.cwd();
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

write('tasks/next-task.json', JSON.stringify({
  id: 'task_' + Date.now(),
  title: 'Build pruefen und Projektstatus melden',
  goal: 'Der lokale Agent-Worker soll kontrolliert npm run build ausfuehren und das Ergebnis speichern.',
  allowedCommands: [
    'git status --short',
    'npm run build'
  ],
  notes: [
    'Keine Secrets ausgeben.',
    'Keine externen Provider-Calls.',
    'Nur whitelisted Commands ausfuehren.',
    'Vor Ausfuehrung im Terminal bestaetigen.'
  ],
  createdAt: new Date().toISOString()
}, null, 2));

write('tasks/last-result.json', JSON.stringify({
  ok: null,
  message: 'Noch kein Worker-Lauf ausgefuehrt.',
  updatedAt: new Date().toISOString()
}, null, 2));

write('logs/last-agent-worker.log', 'Noch kein Worker-Lauf ausgefuehrt.\n');

const worker = `const fs = require('fs');
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
  fs.appendFileSync(logPath, text + '\\n', 'utf8');
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
  if (result.stdout) appendLog('[stdout]\\n' + result.stdout);
  if (result.stderr) appendLog('[stderr]\\n' + result.stderr);
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

  fs.writeFileSync(logPath, '[agent-worker] started ' + new Date().toISOString() + '\\n', 'utf8');
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
`;
write('scripts/agent-worker.cjs', worker);

const helper = `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const task = {
  id: 'task_' + Date.now(),
  title: 'Agent Worker Build Check',
  goal: 'Build pruefen und Ergebnis fuer den Agenten speichern.',
  allowedCommands: ['git status --short', 'npm run build'],
  notes: ['Keine Secrets ausgeben.', 'Nur lokale Commands.', 'Vor Ausfuehrung bestaetigen.'],
  createdAt: new Date().toISOString()
};
fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
fs.writeFileSync(path.join(root, 'tasks/next-task.json'), JSON.stringify(task, null, 2), 'utf8');
console.log('[OK] wrote tasks/next-task.json');
`;
write('scripts/agent-worker-create-build-task.cjs', helper);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['scripts/agent-worker.cjs','scripts/agent-worker-create-build-task.cjs','tasks/next-task.json','tasks/last-result.json','logs/last-agent-worker.log']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}if(ok)console.log('[OK] agent-worker-1 verify passed');process.exit(ok?0:1);`;
write('scripts/v-agent-worker-1.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['worker1:verify'] = 'node scripts/v-agent-worker-1.cjs';
pkg.scripts['worker:run'] = 'node scripts/agent-worker.cjs';
pkg.scripts['worker:build-task'] = 'node scripts/agent-worker-create-build-task.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts worker1:verify worker:run worker:build-task');
console.log('[OK] agent-worker-1 applied');
