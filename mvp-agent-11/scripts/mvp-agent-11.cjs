const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const liveCheckLib = `export type SecureMasterLiveGateCheck = {
  liveGatePrepared: true;
  buildMustBeGreen: true;
  approvalMustBeExplicit: true;
  privacyMustAllowExternal: false;
  providerCallAllowed: false;
  liveModelAllowed: false;
  currentDecisionAllowedForLive: false;
  blockedReason: string;
  nextMilestone: string;
};

export const secureMasterLiveGateCheck: SecureMasterLiveGateCheck = {
  liveGatePrepared: true,
  buildMustBeGreen: true,
  approvalMustBeExplicit: true,
  privacyMustAllowExternal: false,
  providerCallAllowed: false,
  liveModelAllowed: false,
  currentDecisionAllowedForLive: false,
  blockedReason: 'Live-KI ist blockiert: Es gibt noch keinen echten Provider-Adapter, keine Secret-Verwaltung, keine Kostenbremse und keine externe Datenschutzfreigabe.',
  nextMilestone: 'Naechster sinnvoller Schritt: Live-Gate technisch weiter vorbereiten, danach erst einen kontrollierten lokalen Provider-Dry-Run bauen.',
};
`;
write('frontend/lib/cmt-secure-master-live-gate-check.ts', liveCheckLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-live-gate-check')) {
  page = page.replace(
    "import { secureMasterSprintState, type SecureMasterLocalApproval } from '../../../../../lib/cmt-secure-master-sprint-state';",
    "import { secureMasterSprintState, type SecureMasterLocalApproval } from '../../../../../lib/cmt-secure-master-sprint-state';\nimport { secureMasterLiveGateCheck } from '../../../../../lib/cmt-secure-master-live-gate-check';"
  );
}

if (!page.includes('approvalDecision: approval')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, logs };"
  );
}

if (!page.includes('Aktive lokale Freigabe')) {
  page = page.replace(
    "<h2>Lokale Antwort</h2>",
    "<h2>Lokale Antwort</h2>\n            <p style={{ color: '#cbd5e1' }}>Aktive lokale Freigabe: <b>{approval}</b>. Provider-Call erlaubt: <b>{String(secureMasterLiveGateCheck.providerCallAllowed)}</b>.</p>"
  );
}

if (!page.includes('Live-Gate Check')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Live-Gate Check</h2>\n          <p style={{ color: '#fbbf24' }}>{secureMasterLiveGateCheck.blockedReason}</p>\n          <p>Live-Gate vorbereitet: <b>{String(secureMasterLiveGateCheck.liveGatePrepared)}</b></p>\n          <p>Build muss gruen sein: <b>{String(secureMasterLiveGateCheck.buildMustBeGreen)}</b></p>\n          <p>Explizite Freigabe erforderlich: <b>{String(secureMasterLiveGateCheck.approvalMustBeExplicit)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterLiveGateCheck.providerCallAllowed)}</b></p>\n          <p>Live-Modell erlaubt: <b>{String(secureMasterLiveGateCheck.liveModelAllowed)}</b></p>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterLiveGateCheck.nextMilestone}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

if (!page.includes('Export enthaelt lokale Freigabe')) {
  page = page.replace(
    "<button onClick={exportLogs} style={{ border: '1px solid #475569', borderRadius: 10, background: '#0f172a', color: '#e5e7eb', padding: '10px 14px' }}>Logs exportieren</button>",
    "<button onClick={exportLogs} style={{ border: '1px solid #475569', borderRadius: 10, background: '#0f172a', color: '#e5e7eb', padding: '10px 14px' }}>Logs exportieren</button>\n              <span style={{ color: '#94a3b8', fontSize: 12, alignSelf: 'center' }}>Export enthaelt lokale Freigabe + Live-Gate-Snapshot.</span>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-live-gate-check.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Live-Gate Check','secureMasterLiveGateCheck','Aktive lokale Freigabe','approvalDecision: approval','Export enthaelt lokale Freigabe']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-11 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-11.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp11:verify'] = 'node scripts/v-mvp-agent-11.cjs';
pkg.scripts['agent:mvp11:verify'] = 'node scripts/v-mvp-agent-11.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp11:verify agent:mvp11:verify');
console.log('[OK] mvp-agent-11 applied');
