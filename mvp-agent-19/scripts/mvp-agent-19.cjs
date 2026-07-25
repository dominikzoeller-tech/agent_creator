const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const workStateLib = `export type SecureMasterWorkState = {
  localWorkReady: true;
  liveReady: false;
  providerAdapterNext: true;
  currentMainPage: '/cmt/master/secure/agent';
  userInstruction: string;
  nextThreshold: string;
  blockedLiveReasons: string[];
  safeNow: string[];
};

export const secureMasterWorkState: SecureMasterWorkState = {
  localWorkReady: true,
  liveReady: false,
  providerAdapterNext: true,
  currentMainPage: '/cmt/master/secure/agent',
  userInstruction: 'Jetzt lokal mit echten Fragen testen. Noch keine API-Keys eingeben und keine Live-KI aktivieren.',
  nextThreshold: 'Naechste Schwelle: deaktivierten Provider-Adapter vorbereiten, danach kontrollierten Live-Dry-Run planen.',
  blockedLiveReasons: [
    'kein echter Provider-Adapter aktiv',
    'keine Secret-Verwaltung aktiv',
    'keine Kosten-/Token-Bremse aktiv',
    'keine externe Datenschutzfreigabe aktiv',
  ],
  safeNow: [
    'lokal fragen',
    'Gremium lokal auswerten',
    'Privacy-Gate testen',
    'Provider-Dry-Run simulieren',
    'Adapter-Dry-Run simulieren',
    'Logs lokal exportieren',
  ],
};
`;
write('frontend/lib/cmt-secure-master-work-state.ts', workStateLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-work-state')) {
  page = page.replace(
    "import { createSecureMasterOperatorPanel } from '../../../../../lib/cmt-secure-master-operator-panel';",
    "import { createSecureMasterOperatorPanel } from '../../../../../lib/cmt-secure-master-operator-panel';\nimport { secureMasterWorkState } from '../../../../../lib/cmt-secure-master-work-state';"
  );
}

if (!page.includes('workState: secureMasterWorkState')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Arbeitsstatus')) {
  page = page.replace(
    "<section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>",
    "<section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>\n          <h2>Arbeitsstatus</h2>\n          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>\n            <p>Lokal nutzbar: <b>{String(secureMasterWorkState.localWorkReady)}</b></p>\n            <p>Live bereit: <b>{String(secureMasterWorkState.liveReady)}</b></p>\n            <p>Hauptseite: <b>{secureMasterWorkState.currentMainPage}</b></p>\n            <p>Naechste Schwelle: <b>{secureMasterWorkState.providerAdapterNext ? 'Provider-Adapter vorbereiten' : 'offen'}</b></p>\n          </div>\n          <p>{secureMasterWorkState.userInstruction}</p>\n          <p style={{ color: '#bbf7d0' }}>{secureMasterWorkState.nextThreshold}</p>\n          <h3>Jetzt sicher moeglich</h3>\n          <ul>{secureMasterWorkState.safeNow.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Live bleibt blockiert wegen</h3>\n          <ul>{secureMasterWorkState.blockedLiveReasons.map((item) => <li key={item}>{item}</li>)}</ul>\n        </section>\n\n        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-work-state.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Arbeitsstatus','secureMasterWorkState','workState: secureMasterWorkState','Jetzt sicher moeglich','Live bleibt blockiert wegen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-19 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-19.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp19:verify'] = 'node scripts/v-mvp-agent-19.cjs';
pkg.scripts['agent:mvp19:verify'] = 'node scripts/v-mvp-agent-19.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp19:verify agent:mvp19:verify');
console.log('[OK] mvp-agent-19 applied');
