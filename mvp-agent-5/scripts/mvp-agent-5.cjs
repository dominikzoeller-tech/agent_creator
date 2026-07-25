const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const gateLib = `export type ProviderGateStatus = {
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  approvalRequired: true;
  anonymizationRequiredForInternalData: true;
  readyForLiveModel: false;
  nextReadinessStep: string;
  requirements: string[];
};

export const secureMasterProviderGateStatus: ProviderGateStatus = {
  providerEnabled: false,
  internetEnabled: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  approvalRequired: true,
  anonymizationRequiredForInternalData: true,
  readyForLiveModel: false,
  nextReadinessStep: 'Build stabil halten, lokale Testfragen prüfen, Datenschutz-Gate bestätigen, danach Provider-Konfiguration vorbereiten.',
  requirements: [
    'Explizite Freigabe vor Provider-Nutzung',
    'Anonymisierung bei internen oder personenbezogenen Daten',
    'Kein automatischer Internetzugriff',
    'Kosten-/Token-Limit vor Live-Schaltung',
    'Audit-Log für jede externe Anfrage',
  ],
};
`;
write('frontend/lib/cmt-secure-master-provider-gate.ts', gateLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-gate')) {
  page = page.replace(
    "import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';",
    "import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';\nimport { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';"
  );
}

if (!page.includes('Provider-Gate Vorbereitung')) {
  page = page.replace(
    "<p>Browser-Speicherung: <b>browser_optional_local</b></p>",
    "<p>Browser-Speicherung: <b>browser_optional_local</b></p>\n            <h3 style={{ marginTop: 18 }}>Provider-Gate Vorbereitung</h3>\n            <p>Live-Ready: <b>{String(secureMasterProviderGateStatus.readyForLiveModel)}</b></p>\n            <p>Freigabe erforderlich: <b>{String(secureMasterProviderGateStatus.approvalRequired)}</b></p>\n            <p>Anonymisierung bei internen Daten: <b>{String(secureMasterProviderGateStatus.anonymizationRequiredForInternalData)}</b></p>\n            <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderGateStatus.nextReadinessStep}</p>"
  );
}

if (!page.includes('Voraussetzungen vor Live-KI')) {
  page = page.replace(
    "</section>\n\n        {current && (",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>\n          <p style={{ color: '#cbd5e1' }}>Der Agent darf erst live mit einem Modell arbeiten, wenn diese Punkte erfüllt sind:</p>\n          <ul>\n            {secureMasterProviderGateStatus.requirements.map((item) => <li key={item}>{item}</li>)}\n          </ul>\n        </section>\n\n        {current && ("
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-gate.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Gate Vorbereitung','Voraussetzungen vor Live-KI','readyForLiveModel','secureMasterProviderGateStatus']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-5 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-5.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp5:verify'] = 'node scripts/v-mvp-agent-5.cjs';
pkg.scripts['agent:mvp5:verify'] = 'node scripts/v-mvp-agent-5.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp5:verify agent:mvp5:verify');
console.log('[OK] mvp-agent-5 applied');
