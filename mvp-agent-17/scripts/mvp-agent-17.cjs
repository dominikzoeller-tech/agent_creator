const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const historyLib = `export type SecureMasterAdapterDryRunHistoryItem = {
  id: string;
  createdAt: string;
  inputPreview: string;
  approvalDecision: string;
  privacyMode: string;
  adapterPrepared: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  anonymizationRequired: boolean;
  simulatedMessage: string;
  nextStep: string;
};

export const SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY = 'cmt.secureMaster.adapterDryRun.history.v1';

export function createAdapterDryRunHistoryItem(result: any): SecureMasterAdapterDryRunHistoryItem {
  return {
    id: 'adapter_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    inputPreview: result?.requestPreview?.inputPreview ?? 'Keine Eingabe',
    approvalDecision: result?.requestPreview?.approvalDecision ?? 'local_only',
    privacyMode: result?.requestPreview?.privacyMode ?? 'allow_local_only',
    adapterPrepared: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    anonymizationRequired: Boolean(result?.safetyEnvelope?.anonymizationRequired),
    simulatedMessage: result?.responsePreview?.simulatedMessage ?? 'Adapter-Dry-Run blockiert.',
    nextStep: result?.nextStep ?? 'Adapter weiter lokal testen.',
  };
}
`;
write('frontend/lib/cmt-secure-master-adapter-dry-run-history.ts', historyLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-adapter-dry-run-history')) {
  page = page.replace(
    "import { createSecureMasterProviderAdapterDryRun } from '../../../../../lib/cmt-secure-master-provider-adapter-dry-run';",
    "import { createSecureMasterProviderAdapterDryRun } from '../../../../../lib/cmt-secure-master-provider-adapter-dry-run';\nimport { SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY, createAdapterDryRunHistoryItem, type SecureMasterAdapterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-adapter-dry-run-history';"
  );
}

if (!page.includes('const [adapterDryRunHistory, setAdapterDryRunHistory]')) {
  page = page.replace(
    "const [adapterDryRun, setAdapterDryRun] = useState<ReturnType<typeof createSecureMasterProviderAdapterDryRun> | null>(null);",
    "const [adapterDryRun, setAdapterDryRun] = useState<ReturnType<typeof createSecureMasterProviderAdapterDryRun> | null>(null);\n  const [adapterDryRunHistory, setAdapterDryRunHistory] = useState<SecureMasterAdapterDryRunHistoryItem[]>([]);"
  );
}

if (!page.includes('localStorage.getItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY)')) {
  page = page.replace(
    "if (rawDryRuns) setDryRunHistory(JSON.parse(rawDryRuns));\n    } catch {}",
    "if (rawDryRuns) setDryRunHistory(JSON.parse(rawDryRuns));\n    } catch {}\n    try {\n      const rawAdapterDryRuns = localStorage.getItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY);\n      if (rawAdapterDryRuns) setAdapterDryRunHistory(JSON.parse(rawAdapterDryRuns));\n    } catch {}"
  );
}

if (!page.includes('const adapterHistoryItem = createAdapterDryRunHistoryItem')) {
  page = page.replace(
    "function runAdapterDryRun() {\n    setAdapterDryRun(createSecureMasterProviderAdapterDryRun({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));\n  }",
    "function runAdapterDryRun() {\n    const result = createSecureMasterProviderAdapterDryRun({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision });\n    setAdapterDryRun(result);\n    const adapterHistoryItem = createAdapterDryRunHistoryItem(result);\n    const nextAdapterHistory = [adapterHistoryItem, ...adapterDryRunHistory].slice(0, 25);\n    setAdapterDryRunHistory(nextAdapterHistory);\n    localStorage.setItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY, JSON.stringify(nextAdapterHistory, null, 2));\n  }\n\n  function clearAdapterDryRunHistory() {\n    localStorage.removeItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY);\n    setAdapterDryRunHistory([]);\n    setAdapterDryRun(null);\n  }"
  );
}

if (!page.includes('adapterDryRunHistory,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Adapter-Dry-Run-Verlauf')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Dry-Run-Verlauf</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Adapter-Dry-Run-Verlauf</h2>\n          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf simulierter Adapter-Umschlaege. Kein Dispatch, kein Provider-Call.</p>\n          <button onClick={clearAdapterDryRunHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Adapter-Dry-Run-Verlauf löschen</button>\n          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>\n            {adapterDryRunHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Adapter-Dry-Runs.</p>}\n            {adapterDryRunHistory.map((item) => (\n              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Approval: {item.approvalDecision} | Privacy: {item.privacyMode} | Provider-Call: {String(item.providerCallAllowed)}</p>\n                <p>{item.inputPreview}</p>\n                <p>Anonymisierung nötig: {String(item.anonymizationRequired)}</p>\n                <p style={{ color: '#cbd5e1' }}>{item.simulatedMessage}</p>\n              </article>\n            ))}\n          </div>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Dry-Run-Verlauf</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-adapter-dry-run-history.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Adapter-Dry-Run-Verlauf','adapterDryRunHistory','clearAdapterDryRunHistory','SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY','createAdapterDryRunHistoryItem']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-17 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-17.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp17:verify'] = 'node scripts/v-mvp-agent-17.cjs';
pkg.scripts['agent:mvp17:verify'] = 'node scripts/v-mvp-agent-17.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp17:verify agent:mvp17:verify');
console.log('[OK] mvp-agent-17 applied');
