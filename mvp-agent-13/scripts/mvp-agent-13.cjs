const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const historyLib = `export type SecureMasterDryRunHistoryItem = {
  id: string;
  createdAt: string;
  inputPreview: string;
  approvalDecision: string;
  mode: string;
  dryRunOnly: true;
  providerCallAllowed: false;
  simulatedAnswer: string;
  blockedReason: string;
};

export const SECURE_MASTER_DRY_RUN_HISTORY_KEY = 'cmt.secureMaster.providerDryRun.history.v1';

export function createDryRunHistoryItem(result: any, input: string, approvalDecision: string): SecureMasterDryRunHistoryItem {
  return {
    id: 'dry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    inputPreview: input.trim().slice(0, 180),
    approvalDecision,
    mode: result?.mode ?? 'provider_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    simulatedAnswer: result?.simulatedAnswer ?? 'Provider-Dry-Run ohne Ergebnis.',
    blockedReason: result?.blockedReason ?? 'Provider-Call blockiert.',
  };
}
`;
write('frontend/lib/cmt-secure-master-dry-run-history.ts', historyLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-dry-run-history')) {
  page = page.replace(
    "import { createSecureMasterProviderDryRun } from '../../../../../lib/cmt-secure-master-provider-dry-run';",
    "import { createSecureMasterProviderDryRun } from '../../../../../lib/cmt-secure-master-provider-dry-run';\nimport { SECURE_MASTER_DRY_RUN_HISTORY_KEY, createDryRunHistoryItem, type SecureMasterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-dry-run-history';"
  );
}

if (!page.includes('const [dryRunHistory, setDryRunHistory]')) {
  page = page.replace(
    "const [dryRunResult, setDryRunResult] = useState<ReturnType<typeof createSecureMasterProviderDryRun> | null>(null);",
    "const [dryRunResult, setDryRunResult] = useState<ReturnType<typeof createSecureMasterProviderDryRun> | null>(null);\n  const [dryRunHistory, setDryRunHistory] = useState<SecureMasterDryRunHistoryItem[]>([]);"
  );
}

if (!page.includes('SECURE_MASTER_DRY_RUN_HISTORY_KEY')) {
  console.error('[patch failed] import marker missing');
}

if (!page.includes('localStorage.getItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY)')) {
  page = page.replace(
    "if (savedApproval === 'local_only' || savedApproval === 'anonymize_then_send' || savedApproval === 'cancel') setApproval(savedApproval);",
    "if (savedApproval === 'local_only' || savedApproval === 'anonymize_then_send' || savedApproval === 'cancel') setApproval(savedApproval);\n    try {\n      const rawDryRuns = localStorage.getItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY);\n      if (rawDryRuns) setDryRunHistory(JSON.parse(rawDryRuns));\n    } catch {}"
  );
}

if (!page.includes('const historyItem = createDryRunHistoryItem')) {
  page = page.replace(
    "function runProviderDryRun() {\n    setDryRunResult(createSecureMasterProviderDryRun(input, approval));\n  }",
    "function runProviderDryRun() {\n    const result = createSecureMasterProviderDryRun(input, approval);\n    setDryRunResult(result);\n    const historyItem = createDryRunHistoryItem(result, input, approval);\n    const nextHistory = [historyItem, ...dryRunHistory].slice(0, 25);\n    setDryRunHistory(nextHistory);\n    localStorage.setItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY, JSON.stringify(nextHistory, null, 2));\n  }\n\n  function clearDryRunHistory() {\n    localStorage.removeItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY);\n    setDryRunHistory([]);\n    setDryRunResult(null);\n  }"
  );
}

if (!page.includes('dryRunHistory')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };"
  );
}

if (!page.includes('Dry-Run-Verlauf')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Live-Gate Check</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Dry-Run-Verlauf</h2>\n          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf simulierter Provider-Dry-Runs. Keine externe Sendung.</p>\n          <button onClick={clearDryRunHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Dry-Run-Verlauf löschen</button>\n          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>\n            {dryRunHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Dry-Runs.</p>}\n            {dryRunHistory.map((item) => (\n              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Approval: {item.approvalDecision} | Provider-Call: {String(item.providerCallAllowed)}</p>\n                <p>{item.inputPreview}</p>\n                <p style={{ color: '#cbd5e1' }}>{item.simulatedAnswer}</p>\n              </article>\n            ))}\n          </div>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Live-Gate Check</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-dry-run-history.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Dry-Run-Verlauf','dryRunHistory','clearDryRunHistory','SECURE_MASTER_DRY_RUN_HISTORY_KEY','createDryRunHistoryItem']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-13 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-13.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp13:verify'] = 'node scripts/v-mvp-agent-13.cjs';
pkg.scripts['agent:mvp13:verify'] = 'node scripts/v-mvp-agent-13.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp13:verify agent:mvp13:verify');
console.log('[OK] mvp-agent-13 applied');
