const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

function ensureState(page) {
  if (page.includes('selfBuildGoalTop')) return page;
  const marker = "const [input, setInput] = useState('');";
  const insert = marker + "\n  const [selfBuildGoalTop, setSelfBuildGoalTop] = useState('Baue dich selbst fertig zu einem wirklich nutzbaren Arbeitsagenten.');\n  const [selfBuildPlanTop, setSelfBuildPlanTop] = useState<any | null>(null);";
  if (page.includes(marker)) return page.replace(marker, insert);
  return page.replace('export default function Page() {', "export default function Page() {\n  const [selfBuildGoalTop, setSelfBuildGoalTop] = useState('Baue dich selbst fertig zu einem wirklich nutzbaren Arbeitsagenten.');\n  const [selfBuildPlanTop, setSelfBuildPlanTop] = useState<any | null>(null);");
}

function ensureFunctions(page) {
  if (page.includes('async function runSelfBuildPlanTop')) return page;
  const marker = 'function exportLogs() {';
  const funcs = [
    'async function runSelfBuildPlanTop() {',
    '  try {',
    "    const response = await fetch('/api/cmt/master/secure/self-build/plan', {",
    "      method: 'POST',",
    "      headers: { 'content-type': 'application/json' },",
    '      body: JSON.stringify({ goal: selfBuildGoalTop }),',
    '    });',
    '    setSelfBuildPlanTop(await response.json());',
    '  } catch (error) {',
    "    setSelfBuildPlanTop({ ok: false, error: 'self_build_failed' });",
    '  }',
    '}',
    '',
    'function copySelfBuildPromptTop() {',
    "  const text = selfBuildPlanTop?.copilotPrompt || '';",
    '  if (text) navigator.clipboard?.writeText(text);',
    '}',
    '',
  ].join('\n');
  if (page.includes(marker)) return page.replace(marker, funcs + marker);
  return page;
}

function ensureBlock(page) {
  if (page.includes('Agent-Selbstbau TOP')) return page;
  const block = [
    '',
    "        <section style={{ border: '3px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>",
    '          <h2>Agent-Selbstbau TOP</h2>',
    "          <p style={{ color: '#bbf7d0' }}>Hier ist der Selbstbau-Modus. Nicht ins normale Fragefeld schreiben: Ziel hier eintragen und Selbstbauplan erzeugen.</p>",
    '          <textarea',
    '            value={selfBuildGoalTop}',
    '            onChange={(event) => setSelfBuildGoalTop(event.target.value)}',
    "            style={{ width: '100%', minHeight: 82, borderRadius: 12, border: '1px solid #22c55e', background: '#020617', color: '#e5e7eb', padding: 12 }}",
    '          />',
    "          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>",
    "            <button onClick={runSelfBuildPlanTop} style={{ border: 0, borderRadius: 10, background: '#22c55e', color: '#052e16', padding: '10px 14px', fontWeight: 800 }}>Selbstbauplan erzeugen</button>",
    "            <button onClick={copySelfBuildPromptTop} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Copilot-Prompt kopieren</button>",
    '          </div>',
    '          {selfBuildPlanTop && (',
    "            <div style={{ marginTop: 12, border: '1px solid #166534', borderRadius: 12, background: '#020617', padding: 12 }}>",
    "              <h3>{selfBuildPlanTop.title ?? 'Selbstbauplan'}</h3>",
    '              <p>{selfBuildPlanTop.summary}</p>',
    "              <p>Naechster Patch: <b>{selfBuildPlanTop.nextPatchName}</b> | Prioritaet: <b>{selfBuildPlanTop.priority}</b></p>",
    '              <h4>Dateien</h4>',
    '              <ul>{selfBuildPlanTop.filesToCreateOrEdit?.map((item: string) => <li key={item}>{item}</li>)}</ul>',
    '              <h4>Konkrete Schritte</h4>',
    '              <ul>{selfBuildPlanTop.concreteSteps?.map((item: string) => <li key={item}>{item}</li>)}</ul>',
    '              <h4>Copilot-Prompt</h4>',
    "              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{selfBuildPlanTop.copilotPrompt}</pre>",
    '            </div>',
    '          )}',
    '        </section>',
    '',
  ].join('\n');

  // Insert after first header section closing. If not found, insert before Operator-Panel.
  const firstClose = page.indexOf('</section>');
  if (firstClose >= 0) {
    return page.slice(0, firstClose + '</section>'.length) + block + page.slice(firstClose + '</section>'.length);
  }
  const op = page.indexOf('Operator-Panel');
  if (op >= 0) {
    const beforeSection = page.lastIndexOf('<section', op);
    if (beforeSection >= 0) return page.slice(0, beforeSection) + block + page.slice(beforeSection);
  }
  return page;
}

const routeRel = 'frontend/app/api/cmt/master/secure/self-build/plan/route.ts';
const route = [
  "import { NextResponse } from 'next/server';",
  '',
  'function createPlan(goal: string) {',
  "  const effectiveGoal = goal || 'Baue dich selbst zu einem nutzbaren Arbeitsagenten weiter.';",
  '  return {',
  '    ok: true,',
  "    mode: 'self_build_plan',",
  "    title: 'Agent-Selbstbauplan',",
  "    summary: 'Der Agent priorisiert ab jetzt Arbeitsmodus, Antwortqualitaet und eigene Patch-Vorschlaege statt weiterer Sicherheits-Dashboards.',",
  "    nextPatchName: 'self-builder-autopatch',",
  "    priority: 'high',",
  "    filesToCreateOrEdit: ['frontend/app/cmt/master/secure/agent/page.tsx', 'frontend/app/api/cmt/master/secure/self-build/plan/route.ts', 'frontend/lib/cmt-secure-master-self-builder.ts'],",
  "    concreteSteps: ['Arbeitsmodus oben sichtbar machen: Frage rein, Antwort raus.', 'Sicherheitsbereiche nach unten schieben oder einklappen.', 'Patch-Vorschlag mit Dateien, Testbefehl und Commit-Message erzeugen.', 'Naechsten Patch als direkte Anweisung fuer VS Code Copilot ausgeben.'],",
  "    guardrails: ['Keine echten API-Keys im Client oder Repo.', 'Keine internen/personenbezogenen Daten extern senden.', 'Keine automatische Dateiaenderung ohne Nutzer-Ausfuehrung.'],",
  "    copilotPrompt: 'Du bist VS Code Copilot im Projekt ai-assistant/agent_creator. Ziel: ' + effectiveGoal + '\\n\\nBaue den Secure Master Agent jetzt praktisch nutzbar weiter. Prioritaet: Arbeitsflaeche und Selbstbau-Modus statt Diagnose-Dashboard.\\n\\nErstelle konkrete Datei-Aenderungen, Testbefehle und eine Commit-Message. Keine echten Secrets im Client oder Repo.'",
  '  };',
  '}',
  '',
  'export async function POST(request: Request) {',
  '  let body: any = {};',
  '  try { body = await request.json(); } catch {}',
  "  return NextResponse.json(createPlan(typeof body?.goal === 'string' ? body.goal : ''));",
  '}',
  '',
  'export async function GET() {',
  "  return NextResponse.json(createPlan('Baue dich selbst weiter.'));",
  '}',
  '',
].join('\n');
write(routeRel, route);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');
page = ensureState(page);
page = ensureFunctions(page);
page = ensureBlock(page);
write(pageRel, page);

const verify = [
  "const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;",
  "for(const rel of ['frontend/app/api/cmt/master/secure/self-build/plan/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}",
  "const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');",
  "for(const token of ['Agent-Selbstbau TOP','runSelfBuildPlanTop','selfBuildPlanTop','Selbstbauplan erzeugen','Copilot-Prompt kopieren']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}",
  "if(ok)console.log('[OK] self-builder top v2 verify passed');process.exit(ok?0:1);",
].join('');
write('scripts/v-hotfix-self-builder-top-v2.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['selftop2:verify'] = 'node scripts/v-hotfix-self-builder-top-v2.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script selftop2:verify');
console.log('[OK] self-builder top v2 applied');
