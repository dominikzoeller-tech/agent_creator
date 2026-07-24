const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

write('frontend/lib/cmt-master-committee-status.ts', `import { getSecureMasterCommitteeDemo, type SecureMasterCommitteeResult } from './cmt-master-committee';

export type SecureMasterCommitteeStatus = {
  phase: '125.1';
  label: 'Secure Master Committee Status';
  mainCommitteePage: '/cmt/master/secure/committee';
  mainQualityPage: '/cmt/master/secure/quality';
  apiRoute: '/api/cmt/master/secure/committee';
  demo: SecureMasterCommitteeResult;
  committeeState: {
    integratedInSecureMaster: true;
    fiveRolesVisible: true;
    localOnly: true;
    decisionQuestionsDetected: true;
    finalRecommendationVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  roles: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  return {
    phase: '125.1',
    label: 'Secure Master Committee Status',
    mainCommitteePage: '/cmt/master/secure/committee',
    mainQualityPage: '/cmt/master/secure/quality',
    apiRoute: '/api/cmt/master/secure/committee',
    demo: getSecureMasterCommitteeDemo(),
    committeeState: {
      integratedInSecureMaster: true,
      fiveRolesVisible: true,
      localOnly: true,
      decisionQuestionsDetected: true,
      finalRecommendationVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Das 5er-Gremium ist lokal in den Secure Master integriert. Es zeigt Rollen, Zusammenfassung und Empfehlung, ohne Provider oder Internet zu nutzen.',
    },
    roles: [
      'Visionär',
      'Skeptiker',
      'Umsetzer',
      'Datenschutz & Risiko',
      'Wirtschaftlichkeit & Praxisnutzen',
    ],
    testPrompts: [
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Soll ich fuer diese Produktentscheidung das Gremium fragen?',
      'Welche Risiken hat der naechste Projektschritt?',
      'Ist diese interne Kundensache sicher extern nutzbar?',
      'Soll ich erst weiter lokal testen oder Provider vorbereiten?',
    ],
    nextMilestones: [
      'Gremiumsausgabe in Hauptseite /cmt/master/secure integrieren',
      'Rollenantworten etwas spezifischer pro Intent machen',
      'Gremiumsempfehlung klarer priorisieren',
      'Provider-Readiness weiter blockiert vorbereiten',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/committee/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterCommitteeStatus } from '../../../../../../../lib/cmt-master-committee-status';

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeStatus());
}
`);

write('frontend/app/cmt/master/secure/committee/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterCommitteeStatus } from '../../../../../../lib/cmt-master-committee-status';

export default function SecureMasterCommitteeStatusPage() {
  const status = getSecureMasterCommitteeStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 125.1</h1>
        <h2>{status.label}</h2>
        <p>{status.committeeState.summary}</p>
        <p><Link href={status.mainCommitteePage}>Committee-Testseite öffnen</Link></p>
        <p><Link href={status.mainQualityPage}>Quality-Testseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Committee State</h3>
        <ul>
          <li>integratedInSecureMaster: {String(status.committeeState.integratedInSecureMaster)}</li>
          <li>fiveRolesVisible: {String(status.committeeState.fiveRolesVisible)}</li>
          <li>localOnly: {String(status.committeeState.localOnly)}</li>
          <li>decisionQuestionsDetected: {String(status.committeeState.decisionQuestionsDetected)}</li>
          <li>finalRecommendationVisible: {String(status.committeeState.finalRecommendationVisible)}</li>
          <li>liveModelEnabled: {String(status.committeeState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.committeeState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.committeeState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.committeeState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Rollen</h3>
        <ul>{status.roles.map((role) => <li key={role}>{role}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>committeeTriggered: {String(status.demo.committeeTriggered)}</li>
          <li>detectedIntent: {status.demo.detectedIntent}</li>
          <li>roles: {status.demo.committeeRoles.length}</li>
          <li>finalRecommendation: {status.demo.finalRecommendation}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE125_1.md', `# Phase 125.1 - Secure Master Committee Status

Baut eine Statusseite fuer die 5er-Gremium-Integration im Secure Master.

Kurz-Namen:

- Store: frontend/lib/cmt-master-committee-status.ts
- API: /api/cmt/master/secure/committee/status
- UI: /cmt/master/secure/committee/status
- Patch: scripts/p125-1.cjs
- Verify: scripts/v125-1.cjs

Haupt-Testseite:

- /cmt/master/secure/committee

Statusseite:

- /cmt/master/secure/committee/status

Status:

- lokal testbar
- 5er-Gremium sichtbar
- Rollen sichtbar
- finale Empfehlung sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v125-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee-status.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/lib/cmt-master-committee-status.ts', "phase: '125.1'"],
  ['frontend/lib/cmt-master-committee-status.ts', "mainCommitteePage: '/cmt/master/secure/committee'"],
  ['frontend/lib/cmt-master-committee-status.ts', 'integratedInSecureMaster: true'],
  ['frontend/lib/cmt-master-committee-status.ts', 'fiveRolesVisible: true'],
  ['frontend/lib/cmt-master-committee-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/committee/status/route.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/app/cmt/master/secure/committee/status/page.tsx', 'Committee State'],
  ['frontend/app/cmt/master/secure/committee/status/page.tsx', 'Rollen'],
  ['README_PHASE125_1.md', 'Secure Master Committee Status'],
  ['package.json', 'phase125:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.1 Secure Master Committee Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase125:1:verify'] = 'node scripts/v125-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 125.1 Secure Master Committee Status patch applied.');
