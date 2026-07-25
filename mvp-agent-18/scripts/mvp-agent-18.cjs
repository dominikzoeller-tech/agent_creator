const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const panelLib = `export type SecureMasterOperatorPanel = {
  localLogCount: number;
  providerDryRunCount: number;
  adapterDryRunCount: number;
  approvalDecision: string;
  currentRecommendation: string;
  currentRiskLevel: string;
  liveStatus: 'blocked';
  providerCallAllowed: false;
  dryRunOnly: true;
  nextThreshold: string;
};

export function createSecureMasterOperatorPanel(params: {
  localLogCount: number;
  providerDryRunCount: number;
  adapterDryRunCount: number;
  approvalDecision: string;
  currentRecommendation?: string;
  currentRiskLevel?: string;
}): SecureMasterOperatorPanel {
  return {
    localLogCount: params.localLogCount,
    providerDryRunCount: params.providerDryRunCount,
    adapterDryRunCount: params.adapterDryRunCount,
    approvalDecision: params.approvalDecision,
    currentRecommendation: params.currentRecommendation ?? 'none',
    currentRiskLevel: params.currentRiskLevel ?? 'none',
    liveStatus: 'blocked',
    providerCallAllowed: false,
    dryRunOnly: true,
    nextThreshold: 'Naechste Schwelle: Provider-Adapter als deaktivierten Codepfad vorbereiten. Noch keine Live-KI aktivieren.',
  };
}
`;
write('frontend/lib/cmt-secure-master-operator-panel.ts', panelLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-operator-panel')) {
  page = page.replace(
    "import { createAdapterDryRunHistoryItem, type SecureMasterAdapterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-adapter-dry-run-history';",
    "import { createAdapterDryRunHistoryItem, type SecureMasterAdapterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-adapter-dry-run-history';\nimport { createSecureMasterOperatorPanel } from '../../../../../lib/cmt-secure-master-operator-panel';"
  );
}

if (!page.includes('const operatorPanel = createSecureMasterOperatorPanel')) {
  page = page.replace(
    "const actionPlan = current ? createSecureMasterActionPlan({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval, hasProviderDryRun: Boolean(dryRunResult) }) : null;",
    "const actionPlan = current ? createSecureMasterActionPlan({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval, hasProviderDryRun: Boolean(dryRunResult) }) : null;\n  const operatorPanel = createSecureMasterOperatorPanel({ localLogCount: logs.length, providerDryRunCount: dryRunHistory.length, adapterDryRunCount: adapterDryRunHistory.length, approvalDecision: approval, currentRecommendation: decisionSummary?.recommendation, currentRiskLevel: decisionSummary?.riskLevel });"
  );
}

if (!page.includes('operatorPanel,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Operator-Panel')) {
  page = page.replace(
    "<section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>",
    "<section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Operator-Panel</h2>\n          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>\n            <p>Lokale Logs: <b>{operatorPanel.localLogCount}</b></p>\n            <p>Provider-Dry-Runs: <b>{operatorPanel.providerDryRunCount}</b></p>\n            <p>Adapter-Dry-Runs: <b>{operatorPanel.adapterDryRunCount}</b></p>\n            <p>Approval: <b>{operatorPanel.approvalDecision}</b></p>\n            <p>Empfehlung: <b>{operatorPanel.currentRecommendation}</b></p>\n            <p>Risiko: <b>{operatorPanel.currentRiskLevel}</b></p>\n            <p>Live-Status: <b>{operatorPanel.liveStatus}</b></p>\n            <p>Provider-Call: <b>{String(operatorPanel.providerCallAllowed)}</b></p>\n          </div>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{operatorPanel.nextThreshold}</p>\n        </section>\n\n        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-operator-panel.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Operator-Panel','operatorPanel','createSecureMasterOperatorPanel','nextThreshold','Provider-Dry-Runs']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-18 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-18.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp18:verify'] = 'node scripts/v-mvp-agent-18.cjs';
pkg.scripts['agent:mvp18:verify'] = 'node scripts/v-mvp-agent-18.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp18:verify agent:mvp18:verify');
console.log('[OK] mvp-agent-18 applied');
