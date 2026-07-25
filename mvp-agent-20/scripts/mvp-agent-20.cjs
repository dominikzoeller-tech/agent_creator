const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const contractLib = `export type SecureMasterProviderAdapterContract = {
  contractPrepared: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  dryRunOnly: true;
  selectedProvider: 'none';
  selectedModel: 'none';
  requestEnvelopePreview: {
    inputPreview: string;
    approvalDecision: string;
    privacyDecision: string;
    purpose: string;
    secretsIncluded: false;
  };
  responseEnvelopePreview: {
    status: 'blocked_dry_run';
    message: string;
    providerResponseIncluded: false;
  };
  activationRequirements: string[];
  nextStep: string;
};

export function createSecureMasterProviderAdapterContract(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAdapterContract {
  return {
    contractPrepared: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    dryRunOnly: true,
    selectedProvider: 'none',
    selectedModel: 'none',
    requestEnvelopePreview: {
      inputPreview: params.input.trim().slice(0, 240) || 'Keine Eingabe',
      approvalDecision: params.approvalDecision,
      privacyDecision: params.privacyDecision ?? 'allow_local_only',
      purpose: 'Deaktivierten Provider-Adapter lokal vorbereiten, ohne externe Anfrage.',
      secretsIncluded: false,
    },
    responseEnvelopePreview: {
      status: 'blocked_dry_run',
      message: 'Provider-Adapter-Contract erstellt. Dispatch und Provider-Call bleiben blockiert.',
      providerResponseIncluded: false,
    },
    activationRequirements: [
      'Build muss gruen sein',
      'Provider-Konfiguration muss validiert sein',
      'Secret-Verwaltung muss aktiv sein',
      'Kosten-/Token-Limit muss gesetzt sein',
      'Privacy-Gate muss externe Verarbeitung erlauben',
      'Explizite Nutzerfreigabe muss vorliegen',
      'Audit-Log muss fuer jeden externen Call geschrieben werden',
    ],
    nextStep: 'Danach: echten Adapter nur als deaktivierten Codepfad einbauen. Live-Schalter bleibt weiterhin aus.',
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-adapter-contract.ts', contractLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-adapter-contract')) {
  page = page.replace(
    "import { secureMasterWorkState } from '../../../../../lib/cmt-secure-master-work-state';",
    "import { secureMasterWorkState } from '../../../../../lib/cmt-secure-master-work-state';\nimport { createSecureMasterProviderAdapterContract } from '../../../../../lib/cmt-secure-master-provider-adapter-contract';"
  );
}

if (!page.includes('const [providerAdapterContract, setProviderAdapterContract]')) {
  page = page.replace(
    "const [adapterDryRunHistory, setAdapterDryRunHistory] = useState<SecureMasterAdapterDryRunHistoryItem[]>([]);",
    "const [adapterDryRunHistory, setAdapterDryRunHistory] = useState<SecureMasterAdapterDryRunHistoryItem[]>([]);\n  const [providerAdapterContract, setProviderAdapterContract] = useState<ReturnType<typeof createSecureMasterProviderAdapterContract> | null>(null);"
  );
}

if (!page.includes('function createAdapterContract')) {
  page = page.replace(
    "function runAdapterDryRun() {",
    "function createAdapterContract() {\n    setProviderAdapterContract(createSecureMasterProviderAdapterContract({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));\n  }\n\n  function runAdapterDryRun() {"
  );
}

if (!page.includes('providerAdapterContract,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Provider-Adapter-Contract')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Adapter-Dry-Run</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Contract</h2>\n          <p style={{ color: '#cbd5e1' }}>Bereitet den spaeteren Adapter-Codepfad als blockierten Contract vor. Kein Dispatch, kein Provider-Call.</p>\n          <button onClick={createAdapterContract} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Adapter-Contract erstellen</button>\n          {providerAdapterContract && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Contract vorbereitet: <b>{String(providerAdapterContract.contractPrepared)}</b></p>\n              <p>Dispatch erlaubt: <b>{String(providerAdapterContract.adapterDispatchAllowed)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(providerAdapterContract.providerCallAllowed)}</b></p>\n              <p>Provider: <b>{providerAdapterContract.selectedProvider}</b> | Modell: <b>{providerAdapterContract.selectedModel}</b></p>\n              <h3>Request Envelope Preview</h3>\n              <p>{providerAdapterContract.requestEnvelopePreview.inputPreview}</p>\n              <p>Approval: {providerAdapterContract.requestEnvelopePreview.approvalDecision} | Privacy: {providerAdapterContract.requestEnvelopePreview.privacyDecision} | Secrets: {String(providerAdapterContract.requestEnvelopePreview.secretsIncluded)}</p>\n              <h3>Response Envelope Preview</h3>\n              <p>{providerAdapterContract.responseEnvelopePreview.message}</p>\n              <h3>Aktivierungsanforderungen</h3>\n              <ul>{providerAdapterContract.activationRequirements.map((item) => <li key={item}>{item}</li>)}</ul>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAdapterContract.nextStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Adapter-Dry-Run</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-adapter-contract.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Adapter-Contract','createAdapterContract','providerAdapterContract','createSecureMasterProviderAdapterContract','Aktivierungsanforderungen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-20 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-20.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp20:verify'] = 'node scripts/v-mvp-agent-20.cjs';
pkg.scripts['agent:mvp20:verify'] = 'node scripts/v-mvp-agent-20.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp20:verify agent:mvp20:verify');
console.log('[OK] mvp-agent-20 applied');
