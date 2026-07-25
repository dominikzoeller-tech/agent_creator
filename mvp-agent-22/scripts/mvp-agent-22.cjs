const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const matrixLib = `export type SecureMasterLiveReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  requiredForLive: true;
  detail: string;
};

export type SecureMasterLiveReadinessMatrix = {
  canGoLive: false;
  localMvpReady: true;
  providerLiveBlocked: true;
  items: SecureMasterLiveReadinessItem[];
  missingCriticalCount: number;
  nextSafeStep: string;
};

export function createSecureMasterLiveReadinessMatrix(params: {
  hasAdapterContract: boolean;
  hasAdapterPipeline: boolean;
  approvalDecision: string;
  providerCallAllowed: boolean;
}): SecureMasterLiveReadinessMatrix {
  const items: SecureMasterLiveReadinessItem[] = [
    {
      id: 'build',
      label: 'Build stabil',
      ready: true,
      requiredForLive: true,
      detail: 'Build muss gruen sein, bevor Live-KI aktiviert wird.',
    },
    {
      id: 'privacy_gate',
      label: 'Privacy-Gate sichtbar',
      ready: true,
      requiredForLive: true,
      detail: 'Interne Daten muessen erkannt und externe Weitergabe muss blockierbar sein.',
    },
    {
      id: 'approval',
      label: 'Explizite Freigabe',
      ready: params.approvalDecision !== 'cancel',
      requiredForLive: true,
      detail: 'Nutzerfreigabe muss vor externer Verarbeitung vorhanden sein.',
    },
    {
      id: 'adapter_contract',
      label: 'Provider-Adapter-Contract',
      ready: params.hasAdapterContract,
      requiredForLive: true,
      detail: 'Deaktivierter Adapter-Contract muss lokal getestet sein.',
    },
    {
      id: 'adapter_pipeline',
      label: 'Provider-Adapter-Pipeline',
      ready: params.hasAdapterPipeline,
      requiredForLive: true,
      detail: 'Pipeline muss prepare, validate, approve und dispatch_blocked abbilden.',
    },
    {
      id: 'secret_management',
      label: 'Secret-Verwaltung',
      ready: false,
      requiredForLive: true,
      detail: 'API-Keys duerfen nicht im Browser oder Repo gespeichert werden.',
    },
    {
      id: 'budget_limit',
      label: 'Kosten-/Token-Limit',
      ready: false,
      requiredForLive: true,
      detail: 'Vor Live-KI braucht es ein Kosten- und Tokenlimit.',
    },
    {
      id: 'audit_log',
      label: 'Audit-Log fuer externe Calls',
      ready: false,
      requiredForLive: true,
      detail: 'Jeder echte Provider-Call muss protokolliert werden.',
    },
    {
      id: 'provider_call',
      label: 'Provider-Call erlaubt',
      ready: params.providerCallAllowed,
      requiredForLive: true,
      detail: 'Bleibt aktuell bewusst false.',
    },
  ];

  const missingCriticalCount = items.filter((item) => item.requiredForLive && !item.ready).length;

  return {
    canGoLive: false,
    localMvpReady: true,
    providerLiveBlocked: true,
    items,
    missingCriticalCount,
    nextSafeStep: 'Weiter lokal testen. Danach Secret-Verwaltung, Kostenlimit und Audit-Log vorbereiten. Erst dann Live-KI diskutieren.',
  };
}
`;
write('frontend/lib/cmt-secure-master-live-readiness-matrix.ts', matrixLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-live-readiness-matrix')) {
  page = page.replace(
    "import { createSecureMasterProviderAdapterPipeline } from '../../../../../lib/cmt-secure-master-provider-adapter-pipeline';",
    "import { createSecureMasterProviderAdapterPipeline } from '../../../../../lib/cmt-secure-master-provider-adapter-pipeline';\nimport { createSecureMasterLiveReadinessMatrix } from '../../../../../lib/cmt-secure-master-live-readiness-matrix';"
  );
}

if (!page.includes('const liveReadinessMatrix = createSecureMasterLiveReadinessMatrix')) {
  page = page.replace(
    "const providerAdapterPipeline = createSecureMasterProviderAdapterPipeline({ approvalDecision: approval, privacyDecision: current?.privacyDecision, hasAdapterContract: Boolean(providerAdapterContract) });",
    "const providerAdapterPipeline = createSecureMasterProviderAdapterPipeline({ approvalDecision: approval, privacyDecision: current?.privacyDecision, hasAdapterContract: Boolean(providerAdapterContract) });\n  const liveReadinessMatrix = createSecureMasterLiveReadinessMatrix({ hasAdapterContract: Boolean(providerAdapterContract), hasAdapterPipeline: true, approvalDecision: approval, providerCallAllowed: false });"
  );
}

if (!page.includes('liveReadinessMatrix,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveReadinessMatrix, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Live-Readiness-Matrix')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Pipeline</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>\n          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>canGoLive: {String(liveReadinessMatrix.canGoLive)}</span>\n            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>localMvpReady: {String(liveReadinessMatrix.localMvpReady)}</span>\n            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>missingCritical: {liveReadinessMatrix.missingCriticalCount}</span>\n          </div>\n          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>\n            {liveReadinessMatrix.items.map((item) => (\n              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 10 }}>\n                <p><b>{item.ready ? 'OK' : 'FEHLT'}</b> — {item.label}</p>\n                <p style={{ color: '#94a3b8' }}>{item.detail}</p>\n              </article>\n            ))}\n          </div>\n          <p style={{ color: '#fbbf24' }}>{liveReadinessMatrix.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Provider-Adapter-Pipeline</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-live-readiness-matrix.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Live-Readiness-Matrix','liveReadinessMatrix','createSecureMasterLiveReadinessMatrix','canGoLive','missingCritical']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-22 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-22.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp22:verify'] = 'node scripts/v-mvp-agent-22.cjs';
pkg.scripts['agent:mvp22:verify'] = 'node scripts/v-mvp-agent-22.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp22:verify agent:mvp22:verify');
console.log('[OK] mvp-agent-22 applied');
