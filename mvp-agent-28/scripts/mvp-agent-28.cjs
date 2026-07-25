const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const historyLib = `export type SecureMasterProviderAuditHistoryItem = {
  id: string;
  createdAt: string;
  requestId: string;
  approvalDecision: string;
  privacyDecision: string;
  inputPreview: string;
  dispatchStatus: string;
  providerCallAllowed: false;
  secretsIncluded: false;
};

export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY = 'cmt.secureMaster.providerAudit.history.v1';

export function createProviderAuditHistoryItem(envelope: any): SecureMasterProviderAuditHistoryItem {
  return {
    id: 'audit_hist_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    requestId: envelope?.requestId ?? 'unknown',
    approvalDecision: envelope?.approvalDecision ?? 'local_only',
    privacyDecision: envelope?.privacyDecision ?? 'allow_local_only',
    inputPreview: envelope?.inputPreview ?? 'Keine Eingabe',
    dispatchStatus: envelope?.dispatchStatus ?? 'blocked_before_provider_call',
    providerCallAllowed: false,
    secretsIncluded: false,
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-audit-history.ts', historyLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-audit-history')) {
  page = page.replace(
    "import { createSecureMasterProviderAuditEnvelope } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';",
    "import { createSecureMasterProviderAuditEnvelope } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';\nimport { SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, createProviderAuditHistoryItem, type SecureMasterProviderAuditHistoryItem } from '../../../../../lib/cmt-secure-master-provider-audit-history';"
  );
}

if (!page.includes('const [providerAuditHistory, setProviderAuditHistory]')) {
  page = page.replace(
    "const [providerAuditEnvelope, setProviderAuditEnvelope] = useState<ReturnType<typeof createSecureMasterProviderAuditEnvelope> | null>(null);",
    "const [providerAuditEnvelope, setProviderAuditEnvelope] = useState<ReturnType<typeof createSecureMasterProviderAuditEnvelope> | null>(null);\n  const [providerAuditHistory, setProviderAuditHistory] = useState<SecureMasterProviderAuditHistoryItem[]>([]);"
  );
}

if (!page.includes('localStorage.getItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY)')) {
  page = page.replace(
    "if (rawAdapterDryRuns) setAdapterDryRunHistory(JSON.parse(rawAdapterDryRuns));\n    } catch {}",
    "if (rawAdapterDryRuns) setAdapterDryRunHistory(JSON.parse(rawAdapterDryRuns));\n    } catch {}\n    try {\n      const rawAuditHistory = localStorage.getItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY);\n      if (rawAuditHistory) setProviderAuditHistory(JSON.parse(rawAuditHistory));\n    } catch {}"
  );
}

if (!page.includes('const auditHistoryItem = createProviderAuditHistoryItem')) {
  page = page.replace(
    "function createProviderAuditEnvelope() {\n    setProviderAuditEnvelope(createSecureMasterProviderAuditEnvelope({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));\n  }",
    "function createProviderAuditEnvelope() {\n    const envelope = createSecureMasterProviderAuditEnvelope({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision });\n    setProviderAuditEnvelope(envelope);\n    const auditHistoryItem = createProviderAuditHistoryItem(envelope);\n    const nextAuditHistory = [auditHistoryItem, ...providerAuditHistory].slice(0, 50);\n    setProviderAuditHistory(nextAuditHistory);\n    localStorage.setItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, JSON.stringify(nextAuditHistory, null, 2));\n  }\n\n  function clearProviderAuditHistory() {\n    localStorage.removeItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY);\n    setProviderAuditHistory([]);\n    setProviderAuditEnvelope(null);\n  }"
  );
}

if (!page.includes('providerAuditHistory,')) {
  page = page.replace(
    "providerAuditEnvelope,",
    "providerAuditEnvelope, providerAuditHistory,"
  );
}

if (!page.includes('Provider-Audit-Verlauf')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #a78bfa', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Audit-Verlauf</h2>\n          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf vorbereiteter Audit-Envelopes. Kein Provider-Call, keine Secrets.</p>\n          <button onClick={clearProviderAuditHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Audit-Verlauf löschen</button>\n          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>\n            {providerAuditHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Audit-Eintraege.</p>}\n            {providerAuditHistory.map((item) => (\n              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Request: {item.requestId}</p>\n                <p>Approval: {item.approvalDecision} | Privacy: {item.privacyDecision} | Dispatch: {item.dispatchStatus}</p>\n                <p>{item.inputPreview}</p>\n                <p>Provider-Call: {String(item.providerCallAllowed)} | Secrets: {String(item.secretsIncluded)}</p>\n              </article>\n            ))}\n          </div>\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-audit-history.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Audit-Verlauf','providerAuditHistory','clearProviderAuditHistory','SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY','createProviderAuditHistoryItem']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-28 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-28.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp28:verify'] = 'node scripts/v-mvp-agent-28.cjs';
pkg.scripts['agent:mvp28:verify'] = 'node scripts/v-mvp-agent-28.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp28:verify agent:mvp28:verify');
console.log('[OK] mvp-agent-28 applied');
