const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const sprintLib = `export type SecureMasterLocalApproval = 'local_only' | 'anonymize_then_send' | 'cancel';

export type SecureMasterSprintState = {
  localApprovalKey: string;
  defaultApproval: SecureMasterLocalApproval;
  providerCallAllowed: false;
  externalSendAllowed: false;
  liveModelAllowed: false;
  readinessSnapshot: {
    localAgentWorks: true;
    privacyGateVisible: true;
    approvalDecisionVisible: true;
    providerConfigVisible: true;
    providerValidationVisible: true;
    providerCallAllowed: false;
    nextMilestone: string;
  };
  quickTests: string[];
  nextActions: string[];
};

export const secureMasterSprintState: SecureMasterSprintState = {
  localApprovalKey: 'cmt.secureMaster.localApproval.v1',
  defaultApproval: 'local_only',
  providerCallAllowed: false,
  externalSendAllowed: false,
  liveModelAllowed: false,
  readinessSnapshot: {
    localAgentWorks: true,
    privacyGateVisible: true,
    approvalDecisionVisible: true,
    providerConfigVisible: true,
    providerValidationVisible: true,
    providerCallAllowed: false,
    nextMilestone: 'Provider-Gate technisch vorbereiten, aber erst nach ausdruecklicher Freigabe Live-KI aktivieren.',
  },
  quickTests: [
    'Soll ich den Master-Agenten jetzt live schalten?',
    'Hier sind interne Kundendaten aus einer Kalkulation. Was soll ich tun?',
    'Wie wird morgen das Wetter?',
    'Baue mir spaeter einen Trading-Agenten.',
    'Wie koennen wir den Agenten verbessern?',
  ],
  nextActions: [
    'Lokale Nutzung testen und Fehler sammeln',
    'Build stabil halten',
    'Freigabeentscheidung lokal speichern',
    'Provider-Gate weiter vorbereiten',
    'Erst danach echten Provider anschliessen',
  ],
};
`;
write('frontend/lib/cmt-secure-master-sprint-state.ts', sprintLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-sprint-state')) {
  page = page.replace(
    "import { secureMasterApprovalDecisionPreview } from '../../../../../lib/cmt-secure-master-approval-decision-preview';",
    "import { secureMasterApprovalDecisionPreview } from '../../../../../lib/cmt-secure-master-approval-decision-preview';\nimport { secureMasterSprintState, type SecureMasterLocalApproval } from '../../../../../lib/cmt-secure-master-sprint-state';"
  );
}

if (!page.includes('const [approval, setApproval]')) {
  page = page.replace(
    "const [current, setCurrent] = useState<AgentLog | null>(null);",
    "const [current, setCurrent] = useState<AgentLog | null>(null);\n  const [approval, setApproval] = useState<SecureMasterLocalApproval>('local_only');"
  );
}

if (!page.includes('localStorage.getItem(secureMasterSprintState.localApprovalKey)')) {
  page = page.replace(
    "setCurrent(loaded[0] ?? null);\n  }, []);",
    "setCurrent(loaded[0] ?? null);\n    const savedApproval = localStorage.getItem(secureMasterSprintState.localApprovalKey) as SecureMasterLocalApproval | null;\n    if (savedApproval === 'local_only' || savedApproval === 'anonymize_then_send' || savedApproval === 'cancel') setApproval(savedApproval);\n  }, []);"
  );
}

if (!page.includes('function chooseApproval')) {
  page = page.replace(
    "function clear() {",
    "function chooseApproval(next: SecureMasterLocalApproval) {\n    setApproval(next);\n    localStorage.setItem(secureMasterSprintState.localApprovalKey, next);\n  }\n\n  function clear() {"
  );
}

if (!page.includes('Sprint-Readiness Snapshot')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Lokale Freigabeauswahl</h2>\n          <p style={{ color: '#cbd5e1' }}>Aktuelle Auswahl: <b>{approval}</b>. Die Auswahl wird nur im Browser gespeichert und loest keinen Provider-Call aus.</p>\n          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n            {(['local_only','anonymize_then_send','cancel'] as SecureMasterLocalApproval[]).map((item) => (\n              <button key={item} onClick={() => chooseApproval(item)} style={{ border: approval === item ? '2px solid #22d3ee' : '1px solid #334155', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>{item}</button>\n            ))}\n          </div>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>Provider-Call erlaubt: {String(secureMasterSprintState.providerCallAllowed)} | Externe Sendung erlaubt: {String(secureMasterSprintState.externalSendAllowed)}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Sprint-Readiness Snapshot</h2>\n          <p>Lokaler Agent funktioniert: <b>{String(secureMasterSprintState.readinessSnapshot.localAgentWorks)}</b></p>\n          <p>Privacy Gate sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.privacyGateVisible)}</b></p>\n          <p>Freigabeentscheidung sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.approvalDecisionVisible)}</b></p>\n          <p>Provider-Konfiguration sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.providerConfigVisible)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterSprintState.readinessSnapshot.providerCallAllowed)}</b></p>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterSprintState.readinessSnapshot.nextMilestone}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Schnelltests</h2>\n          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n            {secureMasterSprintState.quickTests.map((test) => <button key={test} onClick={() => setInput(test)} style={{ border: '1px solid #334155', borderRadius: 999, background: '#020617', color: '#e5e7eb', padding: '6px 10px' }}>{test}</button>)}\n          </div>\n          <h3>Naechste Aktionen</h3>\n          <ul>{secureMasterSprintState.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-sprint-state.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Lokale Freigabeauswahl','Sprint-Readiness Snapshot','Schnelltests','chooseApproval','secureMasterSprintState']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-10 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-10.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp10:verify'] = 'node scripts/v-mvp-agent-10.cjs';
pkg.scripts['agent:mvp10:verify'] = 'node scripts/v-mvp-agent-10.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp10:verify agent:mvp10:verify');
console.log('[OK] mvp-agent-10 applied');
