const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const dryRunLib = `export type SecureMasterProviderDryRunMode = 'local_answer' | 'provider_dry_run';

export type SecureMasterProviderDryRunResult = {
  mode: SecureMasterProviderDryRunMode;
  dryRunOnly: true;
  providerCallAllowed: false;
  providerName: 'none';
  modelName: 'none';
  simulatedLatencyMs: number;
  simulatedAnswer: string;
  blockedReason: string;
  nextStep: string;
};

export function createSecureMasterProviderDryRun(input: string, approvalDecision: string): SecureMasterProviderDryRunResult {
  const text = input.trim();
  const base = text.length > 0 ? text.slice(0, 180) : 'Keine Eingabe';

  return {
    mode: 'provider_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    providerName: 'none',
    modelName: 'none',
    simulatedLatencyMs: 0,
    simulatedAnswer: 'Provider-Dry-Run: Es würde jetzt eine Modellantwort vorbereitet, aber nicht gesendet. Eingabe-Vorschau: ' + base + '. Lokale Freigabe: ' + approvalDecision + '.',
    blockedReason: 'Echter Provider-Call ist blockiert: kein API-Key, kein aktivierter Provider, keine externe Freigabe, kein Live-Schalter.',
    nextStep: 'Als Nächstes Provider-Dry-Run in das Antwort-Log übernehmen und danach erst einen echten Provider-Adapter vorbereiten.',
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-dry-run.ts', dryRunLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-dry-run')) {
  page = page.replace(
    "import { secureMasterLiveGateCheck } from '../../../../../lib/cmt-secure-master-live-gate-check';",
    "import { secureMasterLiveGateCheck } from '../../../../../lib/cmt-secure-master-live-gate-check';\nimport { createSecureMasterProviderDryRun } from '../../../../../lib/cmt-secure-master-provider-dry-run';"
  );
}

if (!page.includes('const [dryRunResult, setDryRunResult]')) {
  page = page.replace(
    "const [approval, setApproval] = useState<SecureMasterLocalApproval>('local_only');",
    "const [approval, setApproval] = useState<SecureMasterLocalApproval>('local_only');\n  const [dryRunResult, setDryRunResult] = useState<ReturnType<typeof createSecureMasterProviderDryRun> | null>(null);"
  );
}

if (!page.includes('function runProviderDryRun')) {
  page = page.replace(
    "function chooseApproval(next: SecureMasterLocalApproval) {",
    "function runProviderDryRun() {\n    setDryRunResult(createSecureMasterProviderDryRun(input, approval));\n  }\n\n  function chooseApproval(next: SecureMasterLocalApproval) {"
  );
}

if (!page.includes('providerDryRun: dryRunResult')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, logs };"
  );
}

if (!page.includes('Provider-Dry-Run')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Live-Gate Check</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Dry-Run</h2>\n          <p style={{ color: '#cbd5e1' }}>Simuliert die spätere Provider-Schicht, ohne Daten zu senden.</p>\n          <button onClick={runProviderDryRun} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Provider-Dry-Run simulieren</button>\n          {dryRunResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Modus: <b>{dryRunResult.mode}</b></p>\n              <p>Dry-Run only: <b>{String(dryRunResult.dryRunOnly)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(dryRunResult.providerCallAllowed)}</b></p>\n              <p>Provider: <b>{dryRunResult.providerName}</b> | Modell: <b>{dryRunResult.modelName}</b></p>\n              <p>{dryRunResult.simulatedAnswer}</p>\n              <p style={{ color: '#fbbf24' }}>{dryRunResult.blockedReason}</p>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{dryRunResult.nextStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Live-Gate Check</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-dry-run.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Dry-Run','runProviderDryRun','dryRunResult','providerDryRun: dryRunResult','createSecureMasterProviderDryRun']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-12 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-12.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp12:verify'] = 'node scripts/v-mvp-agent-12.cjs';
pkg.scripts['agent:mvp12:verify'] = 'node scripts/v-mvp-agent-12.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp12:verify agent:mvp12:verify');
console.log('[OK] mvp-agent-12 applied');
