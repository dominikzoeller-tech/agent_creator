const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const auditLib = `export type SecureMasterProviderAuditEnvelope = {
  auditPrepared: true;
  providerCallAllowed: false;
  externalSharingAllowed: false;
  liveModelEnabled: false;
  secretsIncluded: false;
  createdAt: string;
  requestId: string;
  approvalDecision: string;
  privacyDecision: string;
  inputPreview: string;
  providerName: 'none';
  modelName: 'none';
  dispatchStatus: 'blocked_before_provider_call';
  requiredAuditFieldsLater: string[];
  redactionRules: string[];
  nextSafeStep: string;
};

export function createSecureMasterProviderAuditEnvelope(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAuditEnvelope {
  return {
    auditPrepared: true,
    providerCallAllowed: false,
    externalSharingAllowed: false,
    liveModelEnabled: false,
    secretsIncluded: false,
    createdAt: new Date().toISOString(),
    requestId: 'audit_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    approvalDecision: params.approvalDecision,
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    inputPreview: params.input.trim().slice(0, 220) || 'Keine Eingabe',
    providerName: 'none',
    modelName: 'none',
    dispatchStatus: 'blocked_before_provider_call',
    requiredAuditFieldsLater: [
      'requestId',
      'createdAt',
      'approvalDecision',
      'privacyDecision',
      'providerName',
      'modelName',
      'tokenBudget',
      'redactionApplied',
      'dispatchStatus',
      'providerResponseStatus',
    ],
    redactionRules: [
      'keine API-Keys protokollieren',
      'keine vollstaendigen personenbezogenen Daten protokollieren',
      'nur gekuerzte inputPreview speichern',
      'interne Daten vor externer Nutzung anonymisieren',
      'Provider-Response spaeter nur ohne Secrets speichern',
    ],
    nextSafeStep: 'Als naechstes lokalen Audit-Verlauf vorbereiten. Danach erst Provider-Adapter weiter verdichten.',
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-audit-envelope.ts', auditLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-audit-envelope')) {
  page = page.replace(
    "import { secureMasterServerProviderDryRunContract } from '../../../../../lib/cmt-secure-master-server-provider-dry-run';",
    "import { secureMasterServerProviderDryRunContract } from '../../../../../lib/cmt-secure-master-server-provider-dry-run';\nimport { createSecureMasterProviderAuditEnvelope } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';"
  );
}

if (!page.includes('const [providerAuditEnvelope, setProviderAuditEnvelope]')) {
  page = page.replace(
    "const [serverDryRunResult, setServerDryRunResult] = useState<any | null>(null);",
    "const [serverDryRunResult, setServerDryRunResult] = useState<any | null>(null);\n  const [providerAuditEnvelope, setProviderAuditEnvelope] = useState<ReturnType<typeof createSecureMasterProviderAuditEnvelope> | null>(null);"
  );
}

if (!page.includes('function createProviderAuditEnvelope')) {
  page = page.replace(
    "async function runServerProviderDryRun() {",
    "function createProviderAuditEnvelope() {\n    setProviderAuditEnvelope(createSecureMasterProviderAuditEnvelope({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));\n  }\n\n  async function runServerProviderDryRun() {"
  );
}

if (!page.includes('providerAuditEnvelope,')) {
  page = page.replace(
    "serverDryRunPrepared: secureMasterServerProviderDryRunContract, serverDryRunResult,",
    "serverDryRunPrepared: secureMasterServerProviderDryRunContract, serverDryRunResult, providerAuditEnvelope,"
  );
}

if (!page.includes('Provider-Audit-Envelope')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #a78bfa', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Audit-Envelope</h2>\n          <p style={{ color: '#cbd5e1' }}>Audit-Struktur fuer spaetere Provider-Aufrufe. Kein Provider-Call, keine Secrets.</p>\n          <button onClick={createProviderAuditEnvelope} style={{ border: '1px solid #a78bfa', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Audit-Envelope erstellen</button>\n          {providerAuditEnvelope && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Audit vorbereitet: <b>{String(providerAuditEnvelope.auditPrepared)}</b></p>\n              <p>Request-ID: <b>{providerAuditEnvelope.requestId}</b></p>\n              <p>Dispatch Status: <b>{providerAuditEnvelope.dispatchStatus}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(providerAuditEnvelope.providerCallAllowed)}</b></p>\n              <p>Secrets enthalten: <b>{String(providerAuditEnvelope.secretsIncluded)}</b></p>\n              <p>Input Preview: {providerAuditEnvelope.inputPreview}</p>\n              <h3>Pflichtfelder spaeter</h3>\n              <ul>{providerAuditEnvelope.requiredAuditFieldsLater.map((item) => <li key={item}>{item}</li>)}</ul>\n              <h3>Redaction Rules</h3>\n              <ul>{providerAuditEnvelope.redactionRules.map((item) => <li key={item}>{item}</li>)}</ul>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAuditEnvelope.nextSafeStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-audit-envelope.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Audit-Envelope','createProviderAuditEnvelope','providerAuditEnvelope','createSecureMasterProviderAuditEnvelope','Redaction Rules']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-27 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-27.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp27:verify'] = 'node scripts/v-mvp-agent-27.cjs';
pkg.scripts['agent:mvp27:verify'] = 'node scripts/v-mvp-agent-27.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp27:verify agent:mvp27:verify');
console.log('[OK] mvp-agent-27 applied');
