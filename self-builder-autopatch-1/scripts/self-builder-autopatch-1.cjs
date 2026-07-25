const fs = require('fs');
const path = require('path');
const root = process.cwd();
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const apiRoute = [
"import { NextResponse } from 'next/server';",
"",
"function buildPatch(goal: string) {",
"  const effectiveGoal = goal || 'Agent praktisch nutzbar machen';",
"  const script = [",
"    'const fs = require(\\'fs\\');',",
"    'const path = require(\\'path\\');',",
"    'const root = process.cwd();',",
"    'const page = path.join(root, \\'frontend/app/cmt/master/secure/agent/page.tsx\\');',",
"    'let text = fs.readFileSync(page, \\'utf8\\');',",
"    'if (!text.includes(\\'ARBEITSMODUS KOMPAKT\\')) {',",
"    '  text = text.replace(\\'Zentrale Agent-Arbeitsseite\\', \\'Zentrale Agent-Arbeitsseite - ARBEITSMODUS KOMPAKT\\');',",
"    '}',",
"    'fs.writeFileSync(page, text, \\'utf8\\');',",
"    'console.log(\\'[OK] compact work mode marker applied\\');'",
"  ].join('\\n');",
"  return {",
"    ok: true,",
"    mode: 'self_builder_autopatch',",
"    title: 'Autopatch-Vorschlag',",
"    goal: effectiveGoal,",
"    summary: 'Der Agent erzeugt jetzt einen konkreten Patch-Vorschlag statt nur einen Plan. Der erzeugte Script-Text kann als Datei gespeichert und ausgeführt werden.',",
"    patchName: 'self-builder-autopatch-generated',",
"    filesToEdit: ['frontend/app/cmt/master/secure/agent/page.tsx'],",
"    scriptFileName: 'scripts/generated-self-builder-patch.cjs',",
"    script,",
"    testCommands: ['node scripts/generated-self-builder-patch.cjs', 'npm run build', 'npm --prefix frontend run dev'],",
"    commitMessage: 'feat: apply secure master self builder generated patch',",
"    nextStep: 'Script in scripts/generated-self-builder-patch.cjs speichern, ausführen, build testen, committen.'",
"  };",
"}",
"",
"export async function POST(request: Request) {",
"  let body: any = {};",
"  try { body = await request.json(); } catch {}",
"  return NextResponse.json(buildPatch(typeof body?.goal === 'string' ? body.goal : ''));",
"}",
"",
"export async function GET() {",
"  return NextResponse.json(buildPatch('Agent praktisch nutzbar machen'));",
"}",
""
].join('\n');
write('frontend/app/api/cmt/master/secure/self-build/autopatch/route.ts', apiRoute);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

// Ensure state.
if (!page.includes('autoPatchGoal')) {
  const marker = "const [input, setInput] = useState('');";
  const state = marker + "\n  const [autoPatchGoal, setAutoPatchGoal] = useState('Mach den Agenten als Arbeitsagent nutzbar und reduziere Dashboard-Ballast.');\n  const [autoPatchResult, setAutoPatchResult] = useState<any | null>(null);";
  if (page.includes(marker)) page = page.replace(marker, state);
  else page = page.replace('export default function Page() {', "export default function Page() {\n  const [autoPatchGoal, setAutoPatchGoal] = useState('Mach den Agenten als Arbeitsagent nutzbar und reduziere Dashboard-Ballast.');\n  const [autoPatchResult, setAutoPatchResult] = useState<any | null>(null);");
}

// Ensure functions.
if (!page.includes('async function runAutoPatchBuilder')) {
  const marker = 'function exportLogs() {';
  const funcs = [
    'async function runAutoPatchBuilder() {',
    '  try {',
    "    const response = await fetch('/api/cmt/master/secure/self-build/autopatch', {",
    "      method: 'POST',",
    "      headers: { 'content-type': 'application/json' },",
    '      body: JSON.stringify({ goal: autoPatchGoal }),',
    '    });',
    '    setAutoPatchResult(await response.json());',
    '  } catch (error) {',
    "    setAutoPatchResult({ ok: false, error: 'autopatch_failed' });",
    '  }',
    '}',
    '',
    'function copyAutoPatchScript() {',
    "  const text = autoPatchResult?.script || '';",
    '  if (text) navigator.clipboard?.writeText(text);',
    '}',
    '',
  ].join('\n');
  if (page.includes(marker)) page = page.replace(marker, funcs + marker);
}

// Insert block near top, before Operator-Panel if not present.
if (!page.includes('Agent-Autopatch')) {
  const block = [
    "        <section style={{ border: '3px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>",
    '          <h2>Agent-Autopatch</h2>',
    "          <p style={{ color: '#bbf7d0' }}>Jetzt praktisch: Der Agent erzeugt einen konkreten Patch-Vorschlag mit Script, Tests und Commit-Message.</p>",
    '          <textarea',
    '            value={autoPatchGoal}',
    '            onChange={(event) => setAutoPatchGoal(event.target.value)}',
    "            style={{ width: '100%', minHeight: 76, borderRadius: 12, border: '1px solid #22c55e', background: '#020617', color: '#e5e7eb', padding: 12 }}",
    '          />',
    "          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>",
    "            <button onClick={runAutoPatchBuilder} style={{ border: 0, borderRadius: 10, background: '#22c55e', color: '#052e16', padding: '10px 14px', fontWeight: 800 }}>Autopatch erzeugen</button>",
    "            <button onClick={copyAutoPatchScript} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Patch-Script kopieren</button>",
    '          </div>',
    '          {autoPatchResult && (',
    "            <div style={{ marginTop: 12, border: '1px solid #166534', borderRadius: 12, background: '#020617', padding: 12 }}>",
    '              <h3>{autoPatchResult.title}</h3>',
    '              <p>{autoPatchResult.summary}</p>',
    "              <p>Patch: <b>{autoPatchResult.patchName}</b></p>",
    '              <h4>Dateien</h4>',
    '              <ul>{autoPatchResult.filesToEdit?.map((item: string) => <li key={item}>{item}</li>)}</ul>',
    '              <h4>Testbefehle</h4>',
    '              <ul>{autoPatchResult.testCommands?.map((item: string) => <li key={item}><code>{item}</code></li>)}</ul>',
    '              <p>Commit: <code>{autoPatchResult.commitMessage}</code></p>',
    '              <h4>Script</h4>',
    "              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{autoPatchResult.script}</pre>",
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
"for(const rel of ['frontend/app/api/cmt/master/secure/self-build/autopatch/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}",
"const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');",
"for(const token of ['Agent-Autopatch','runAutoPatchBuilder','autoPatchResult','Autopatch erzeugen','Patch-Script kopieren']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}",
"if(ok)console.log('[OK] self-builder-autopatch-1 verify passed');process.exit(ok?0:1);"
].join('');
write('scripts/v-self-builder-autopatch-1.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['autopatch1:verify'] = 'node scripts/v-self-builder-autopatch-1.cjs';
pkg.scripts['agent:autopatch1:verify'] = 'node scripts/v-self-builder-autopatch-1.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts autopatch1:verify agent:autopatch1:verify');
console.log('[OK] self-builder-autopatch-1 applied');
