const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const pipelineLib = `export type SecureMasterProviderPipelineStage = {
  id: 'prepare' | 'validate' | 'approve' | 'dispatch_blocked';
  label: string;
  status: 'ready' | 'prepared' | 'blocked';
  detail: string;
};

export type SecureMasterProviderAdapterPipeline = {
  pipelinePrepared: true;
  dryRunOnly: true;
  providerCallAllowed: false;
  adapterDispatchAllowed: false;
  currentStage: 'dispatch_blocked';
  stages: SecureMasterProviderPipelineStage[];
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterPipeline(params: {
  approvalDecision: string;
  privacyDecision?: string;
  hasAdapterContract: boolean;
}): SecureMasterProviderAdapterPipeline {
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision;
  const privacyBlocked = privacy !== 'allow_local_only' || approval === 'cancel';

  return {
    pipelinePrepared: true,
    dryRunOnly: true,
    providerCallAllowed: false,
    adapterDispatchAllowed: false,
    currentStage: 'dispatch_blocked',
    stages: [
      {
        id: 'prepare',
        label: 'Adapter vorbereiten',
        status: params.hasAdapterContract ? 'prepared' : 'ready',
        detail: params.hasAdapterContract ? 'Adapter-Contract liegt lokal vor.' : 'Adapter-Contract kann lokal erstellt werden.',
      },
      {
        id: 'validate',
        label: 'Validieren',
        status: 'prepared',
        detail: privacyBlocked ? 'Validierung erkennt Datenschutz-/Freigabegrenze.' : 'Validierung kann lokal simuliert werden.',
      },
      {
        id: 'approve',
        label: 'Freigabe pruefen',
        status: approval === 'local_only' ? 'prepared' : 'blocked',
        detail: approval === 'local_only' ? 'Lokale Freigabe aktiv. Externe Freigabe nicht aktiv.' : 'Externe Freigabe fehlt oder Abbruch gewaehlt.',
      },
      {
        id: 'dispatch_blocked',
        label: 'Dispatch blockiert',
        status: 'blocked',
        detail: 'Provider-Dispatch bleibt blockiert. Kein API-Key, kein Live-Schalter, kein externer Call.',
      },
    ],
    nextSafeStep: 'Als naechstes einen deaktivierten Provider-Adapter-Codepfad mit Tests vorbereiten. Live-Call bleibt aus.',
  };
}
`;
write('frontend/lib/cmt-secure-master-provider-adapter-pipeline.ts', pipelineLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-adapter-pipeline')) {
  page = page.replace(
    "import { createSecureMasterProviderAdapterContract } from '../../../../../lib/cmt-secure-master-provider-adapter-contract';",
    "import { createSecureMasterProviderAdapterContract } from '../../../../../lib/cmt-secure-master-provider-adapter-contract';\nimport { createSecureMasterProviderAdapterPipeline } from '../../../../../lib/cmt-secure-master-provider-adapter-pipeline';"
  );
}

if (!page.includes('const providerAdapterPipeline = createSecureMasterProviderAdapterPipeline')) {
  page = page.replace(
    "const operatorPanel = createSecureMasterOperatorPanel({ localLogCount: logs.length, providerDryRunCount: dryRunHistory.length, adapterDryRunCount: adapterDryRunHistory.length, approvalDecision: approval, currentRecommendation: decisionSummary?.recommendation, currentRiskLevel: decisionSummary?.riskLevel });",
    "const operatorPanel = createSecureMasterOperatorPanel({ localLogCount: logs.length, providerDryRunCount: dryRunHistory.length, adapterDryRunCount: adapterDryRunHistory.length, approvalDecision: approval, currentRecommendation: decisionSummary?.recommendation, currentRiskLevel: decisionSummary?.riskLevel });\n  const providerAdapterPipeline = createSecureMasterProviderAdapterPipeline({ approvalDecision: approval, privacyDecision: current?.privacyDecision, hasAdapterContract: Boolean(providerAdapterContract) });"
  );
}

if (!page.includes('providerAdapterPipeline,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Provider-Adapter-Pipeline')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Contract</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Pipeline</h2>\n          <p style={{ color: '#cbd5e1' }}>Deaktivierte Pipeline fuer spaetere Provider-Aufrufe. Dispatch bleibt blockiert.</p>\n          <div style={{ display: 'grid', gap: 10 }}>\n            {providerAdapterPipeline.stages.map((stage) => (\n              <article key={stage.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n                <p><b>{stage.label}</b> — {stage.status}</p>\n                <p style={{ color: '#94a3b8' }}>{stage.detail}</p>\n              </article>\n            ))}\n          </div>\n          <p style={{ color: '#fbbf24' }}>Current Stage: {providerAdapterPipeline.currentStage}</p>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAdapterPipeline.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Contract</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-adapter-pipeline.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Adapter-Pipeline','providerAdapterPipeline','createSecureMasterProviderAdapterPipeline','dispatch_blocked','nextSafeStep']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-21 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-21.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp21:verify'] = 'node scripts/v-mvp-agent-21.cjs';
pkg.scripts['agent:mvp21:verify'] = 'node scripts/v-mvp-agent-21.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp21:verify agent:mvp21:verify');
console.log('[OK] mvp-agent-21 applied');
