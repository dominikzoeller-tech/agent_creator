const fs = require('fs');
const path = require('path');
const root = process.cwd();
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const taskRoute = `import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const allowedCommandMap: Record<string, string> = {
  status: 'git status --short',
  build: 'npm run build',
  frontendBuild: 'npm --prefix frontend run build',
};

function normalizeCommands(raw: unknown): string[] {
  const requested = Array.isArray(raw) ? raw : ['status', 'build'];
  const commands = requested.map((item) => allowedCommandMap[String(item)]).filter(Boolean);
  return commands.length > 0 ? commands : ['git status --short', 'npm run build'];
}

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch {}

  const root = process.cwd();
  const taskDir = join(root, '..', 'tasks');
  await mkdir(taskDir, { recursive: true });

  const task = {
    id: 'task_' + Date.now(),
    title: typeof body?.title === 'string' ? body.title.slice(0, 160) : 'Agent Worker Aufgabe',
    goal: typeof body?.goal === 'string' ? body.goal.slice(0, 1000) : 'Build pruefen und Ergebnis melden.',
    allowedCommands: normalizeCommands(body?.commands),
    notes: ['Vom Web-Agent geschrieben.', 'Worker fragt im Terminal vor Ausfuehrung.', 'Keine Secrets ausgeben.'],
    createdAt: new Date().toISOString(),
  };

  await writeFile(join(taskDir, 'next-task.json'), JSON.stringify(task, null, 2), 'utf8');
  return NextResponse.json({ ok: true, taskPath: 'tasks/next-task.json', task });
}

export async function GET() {
  const taskPath = join(process.cwd(), '..', 'tasks', 'next-task.json');
  if (!existsSync(taskPath)) return NextResponse.json({ ok: false, message: 'tasks/next-task.json fehlt.' });
  const task = JSON.parse(await readFile(taskPath, 'utf8'));
  return NextResponse.json({ ok: true, task });
}
`;
write('frontend/app/api/cmt/master/secure/worker/task/route.ts', taskRoute);

const resultRoute = `import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function GET() {
  const root = process.cwd();
  const resultPath = join(root, '..', 'tasks', 'last-result.json');
  const logPath = join(root, '..', 'logs', 'last-agent-worker.log');

  if (!existsSync(resultPath)) {
    return NextResponse.json({ ok: false, message: 'tasks/last-result.json fehlt. Worker noch nicht gelaufen.' });
  }

  const result = JSON.parse(await readFile(resultPath, 'utf8'));
  let logPreview = '';
  if (existsSync(logPath)) {
    const log = await readFile(logPath, 'utf8');
    logPreview = log.slice(-8000);
  }

  return NextResponse.json({ ok: true, result, logPreview });
}
`;
write('frontend/app/api/cmt/master/secure/worker/result/route.ts', resultRoute);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('workerTaskGoal')) {
  const marker = "const [input, setInput] = useState('');";
  const state = marker + "\n  const [workerTaskGoal, setWorkerTaskGoal] = useState('Build pruefen und Ergebnis fuer den Agenten speichern.');\n  const [workerTaskResult, setWorkerTaskResult] = useState<any | null>(null);\n  const [workerLastResult, setWorkerLastResult] = useState<any | null>(null);";
  if (page.includes(marker)) page = page.replace(marker, state);
  else page = page.replace('export default function Page() {', "export default function Page() {\n  const [workerTaskGoal, setWorkerTaskGoal] = useState('Build pruefen und Ergebnis fuer den Agenten speichern.');\n  const [workerTaskResult, setWorkerTaskResult] = useState<any | null>(null);\n  const [workerLastResult, setWorkerLastResult] = useState<any | null>(null);");
}

if (!page.includes('async function writeWorkerTask')) {
  const marker = 'function exportLogs() {';
  const funcs = [
    'async function writeWorkerTask() {',
    '  try {',
    "    const response = await fetch('/api/cmt/master/secure/worker/task', {",
    "      method: 'POST',",
    "      headers: { 'content-type': 'application/json' },",
    "      body: JSON.stringify({ title: 'Agent Worker Aufgabe', goal: workerTaskGoal, commands: ['status', 'build'] }),",
    '    });',
    '    setWorkerTaskResult(await response.json());',
    '  } catch (error) {',
    "    setWorkerTaskResult({ ok: false, error: 'worker_task_write_failed' });",
    '  }',
    '}',
    '',
    'async function loadWorkerResult() {',
    '  try {',
    "    const response = await fetch('/api/cmt/master/secure/worker/result');",
    '    setWorkerLastResult(await response.json());',
    '  } catch (error) {',
    "    setWorkerLastResult({ ok: false, error: 'worker_result_load_failed' });",
    '  }',
    '}',
    '',
  ].join('\n');
  if (page.includes(marker)) page = page.replace(marker, funcs + marker);
}

if (!page.includes('Agent-Worker-Steuerung')) {
  const block = [
    "        <section style={{ border: '3px solid #38bdf8', borderRadius: 18, background: '#082f49', padding: 20 }}>",
    '          <h2>Agent-Worker-Steuerung</h2>',
    "          <p style={{ color: '#bae6fd' }}>Hier verbindet sich die Agent-Seite mit dem lokalen Worker. Aufgabe schreiben, dann im Terminal worker:run ausführen.</p>",
    '          <textarea',
    '            value={workerTaskGoal}',
    '            onChange={(event) => setWorkerTaskGoal(event.target.value)}',
    "            style={{ width: '100%', minHeight: 76, borderRadius: 12, border: '1px solid #38bdf8', background: '#020617', color: '#e5e7eb', padding: 12 }}",
    '          />',
    "          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>",
    "            <button onClick={writeWorkerTask} style={{ border: 0, borderRadius: 10, background: '#38bdf8', color: '#082f49', padding: '10px 14px', fontWeight: 800 }}>Worker-Aufgabe schreiben</button>",
    "            <button onClick={loadWorkerResult} style={{ border: '1px solid #38bdf8', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Worker-Ergebnis laden</button>",
    '          </div>',
    "          <p style={{ color: '#bae6fd', fontSize: 13 }}>Terminal danach: <code>npm run worker:run</code></p>",
    '          {workerTaskResult && (',
    "            <div style={{ marginTop: 12, border: '1px solid #0369a1', borderRadius: 12, background: '#020617', padding: 12 }}>",
    '              <p>Task geschrieben: <b>{String(workerTaskResult.ok)}</b></p>',
    '              <p>Pfad: <code>{workerTaskResult.taskPath}</code></p>',
    '              <p>{workerTaskResult.task?.goal}</p>',
    '            </div>',
    '          )}',
    '          {workerLastResult && (',
    "            <div style={{ marginTop: 12, border: '1px solid #0369a1', borderRadius: 12, background: '#020617', padding: 12 }}>",
    '              <p>Worker Ergebnis geladen: <b>{String(workerLastResult.ok)}</b></p>',
    '              <p>Build OK: <b>{String(workerLastResult.result?.ok)}</b></p>',
    '              <p>{workerLastResult.result?.message}</p>',
    "              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 260, overflow: 'auto', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{workerLastResult.logPreview}</pre>",
    '            </div>',
    '          )}',
    '        </section>',
    '',
  ].join('\n');
  const op = page.indexOf('Operator-Panel');
  if (op >= 0) {
    const before = page.lastIndexOf('<section', op);
    if (before >= 0) page = page.slice(0, before) + block + page.slice(before);
    else page = block + page;
  } else {
    const firstClose = page.indexOf('</section>');
    if (firstClose >= 0) page = page.slice(0, firstClose + 10) + '\n' + block + page.slice(firstClose + 10);
    else page += '\n' + block;
  }
}

write(pageRel, page);

const verify = [
"const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;",
"for(const rel of ['frontend/app/api/cmt/master/secure/worker/task/route.ts','frontend/app/api/cmt/master/secure/worker/result/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}",
"const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');",
"for(const token of ['Agent-Worker-Steuerung','writeWorkerTask','loadWorkerResult','Worker-Aufgabe schreiben','Worker-Ergebnis laden']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}",
"if(ok)console.log('[OK] agent-worker-2 verify passed');process.exit(ok?0:1);"
].join('');
write('scripts/v-agent-worker-2.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['worker2:verify'] = 'node scripts/v-agent-worker-2.cjs';
pkg.scripts['agent:worker2:verify'] = 'node scripts/v-agent-worker-2.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts worker2:verify agent:worker2:verify');
console.log('[OK] agent-worker-2 applied');
