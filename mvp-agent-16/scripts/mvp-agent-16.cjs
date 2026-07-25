const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const adapterLib = `export type SecureMasterProviderAdapterDryRun = {
  adapterPrepared: true;
  dryRunOnly: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  providerName: 'none';
  modelName: 'none';
  requestPreview: {
    inputPreview: string;
    approvalDecision: string;
    privacyMode: string;
    purpose: string;
  };
  safetyEnvelope: {
    externalSharingAllowed: false;
    secretsIncluded: false;
    anonymizationRequired: boolean;
    auditRequired: true;
  };
  responsePreview: {
    simulatedStatus: 'blocked_dry_run';
    simulatedMessage: string;
  };
  nextStep: string;
};

export function createSecureMasterProviderAdapterDryRun(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAdapterDryRun {
  const inputPreview = params.input.trim().slice(0, 220) || 'Keine Eingabe';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const anonymizationRequired = privacy !== 'allow_local_only' || params.approvalDecision === 'anonymize_then_send';

  return {
    adapterPrepared: true,
    dryRunOnly: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    providerName: 'none',
    modelName: 'none',
    requestPreview: {
      inputPreview,
      approvalDecision: params.approvalDecision,
      privacyMode: privacy,
      purpose: 'Spaeteren Provider-Aufruf lokal simulieren, ohne externe Sendung.',
    },
    safetyEnvelope: {
      externalSharingAllowed: false,
      secretsIncluded: false,
      anonymizationRequired,
      auditRequired: true,
    },
    responsePreview: {
      simulatedStatus: 'blocked_dry_run',
      simulatedMessage: 'Adapter-Dry-Run erstellt. Dispatch bleibt blockiert, Provider wird nicht aufgerufen.',
    },
    nextStep: 'Naechster Schritt: echten Provider-Adapter nur als deaktivierten Codepfad vorbereiten und erst nach Freigabe aktivierbar machen.',
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-adapter-dry-run.ts', adapterLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-adapter-dry-run')) {
  page = page.replace(
    "import { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';",
    "import { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';\nimport { createSecureMasterProviderAdapterDryRun } from '../../../../../lib/cmt-secure-master-provider-adapter-dry-run';"
  );
}

if (!page.includes('const [adapterDryRun, setAdapterDryRun]')) {
  page = page.replace(
    "const [dryRunHistory, setDryRunHistory] = useState<SecureMasterDryRunHistoryItem[]>([]);",
    "const [dryRunHistory, setDryRunHistory] = useState<SecureMasterDryRunHistoryItem[]>([]);\n  const [adapterDryRun, setAdapterDryRun] = useState<ReturnType<typeof createSecureMasterProviderAdapterDryRun> | null>(null);"
  );
}

if (!page.includes('function runAdapterDryRun')) {
  page = page.replace(
    "function runProviderDryRun() {",
    "function runAdapterDryRun() {\n    setAdapterDryRun(createSecureMasterProviderAdapterDryRun({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));\n  }\n\n  function runProviderDryRun() {"
  );
}

if (!page.includes('adapterDryRun,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, dryRunHistory, logs };"
  );
}

if (!page.includes('Provider-Adapter-Dry-Run')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Dry-Run</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Adapter-Dry-Run</h2>\n          <p style={{ color: '#cbd5e1' }}>Zeigt den spaeteren Adapter-Umschlag, ohne Dispatch und ohne Provider-Call.</p>\n          <button onClick={runAdapterDryRun} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Adapter-Dry-Run erstellen</button>\n          {adapterDryRun && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Adapter vorbereitet: <b>{String(adapterDryRun.adapterPrepared)}</b></p>\n              <p>Dispatch erlaubt: <b>{String(adapterDryRun.adapterDispatchAllowed)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(adapterDryRun.providerCallAllowed)}</b></p>\n              <p>Provider: <b>{adapterDryRun.providerName}</b> | Modell: <b>{adapterDryRun.modelName}</b></p>\n              <h3>Request Preview</h3>\n              <p>{adapterDryRun.requestPreview.inputPreview}</p>\n              <p>Approval: {adapterDryRun.requestPreview.approvalDecision} | Privacy: {adapterDryRun.requestPreview.privacyMode}</p>\n              <h3>Safety Envelope</h3>\n              <p>External Sharing: {String(adapterDryRun.safetyEnvelope.externalSharingAllowed)} | Secrets included: {String(adapterDryRun.safetyEnvelope.secretsIncluded)} | Anonymisierung noetig: {String(adapterDryRun.safetyEnvelope.anonymizationRequired)}</p>\n              <h3>Response Preview</h3>\n              <p>{adapterDryRun.responsePreview.simulatedMessage}</p>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{adapterDryRun.nextStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Dry-Run</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-adapter-dry-run.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Adapter-Dry-Run','runAdapterDryRun','adapterDryRun','createSecureMasterProviderAdapterDryRun','Safety Envelope']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-16 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-16.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp16:verify'] = 'node scripts/v-mvp-agent-16.cjs';
pkg.scripts['agent:mvp16:verify'] = 'node scripts/v-mvp-agent-16.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp16:verify agent:mvp16:verify');
console.log('[OK] mvp-agent-16 applied');
