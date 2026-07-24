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

write('frontend/lib/cmt-ask-status.ts', `import { getCommitteeAskDemo, type CommitteeAskResult } from './cmt-ask';

export type CommitteeAskStatus = {
  phase: '119.2';
  label: 'Gremium Ask Status';
  askDemo: CommitteeAskResult;
  status: {
    currentMode: 'local-testable-plus';
    canAskQuestions: true;
    usesFiveMemberCommittee: true;
    questionIntentDetection: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    internalDataProtectionRequired: true;
    nextMilestone: 'master-router';
    openPage: '/cmt/ask';
    summary: string;
  };
  testQuestions: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeAskStatus(): CommitteeAskStatus {
  const askDemo = getCommitteeAskDemo();
  return {
    phase: '119.2',
    label: 'Gremium Ask Status',
    askDemo,
    status: {
      currentMode: 'local-testable-plus',
      canAskQuestions: true,
      usesFiveMemberCommittee: true,
      questionIntentDetection: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      internalDataProtectionRequired: true,
      nextMilestone: 'master-router',
      openPage: '/cmt/ask',
      summary: 'Der Gremium-Agent ist lokal testbar plus. Er erkennt Fragetypen und nutzt ein 5er-Gremium, ist aber noch nicht live mit KI-Modell.',
    },
    testQuestions: [
      'Wie wird das Wetter morgen?',
      'Soll ich den Gremium-Agenten jetzt live schalten?',
      'Hier sind interne Kundendaten, darfst du das prüfen?',
      'Kannst du einen Immobilienbewertungs-Agenten bauen?',
      'Was ist der nächste Schritt im Projekt?',
      'Lohnt sich diese Entscheidung für mein Unternehmen?',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/ask/status/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeAskStatus } from '../../../../../lib/cmt-ask-status';

export async function GET() {
  return NextResponse.json(getCommitteeAskStatus());
}
`);

write('frontend/app/cmt/ask/status/page.tsx', `import Link from 'next/link';
import { getCommitteeAskStatus } from '../../../../lib/cmt-ask-status';

export default function CommitteeAskStatusPage() {
  const status = getCommitteeAskStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 119.2</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.openPage}>Gremium Ask öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Modus</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>canAskQuestions: {String(status.status.canAskQuestions)}</li>
          <li>usesFiveMemberCommittee: {String(status.status.usesFiveMemberCommittee)}</li>
          <li>questionIntentDetection: {String(status.status.questionIntentDetection)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
          <li>internalDataProtectionRequired: {String(status.status.internalDataProtectionRequired)}</li>
          <li>nextMilestone: {status.status.nextMilestone}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Testfragen</h3>
        <ol>{status.testQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <p><strong>Intent:</strong> {status.askDemo.intent}</p>
        <p><strong>Empfehlung:</strong> {status.askDemo.finalAnswer.recommendation}</p>
        <p><strong>Open Page:</strong> {status.status.openPage}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE119_2.md', `# Phase 119.2 - Gremium Ask Status

Baut eine Statusseite fuer den lokal testbaren Gremium Ask MVP Plus.

Kurz-Namen:

- Store: frontend/lib/cmt-ask-status.ts
- API: /api/cmt/ask/status
- UI: /cmt/ask/status
- Patch: scripts/p119-2.cjs
- Verify: scripts/v119-2.cjs

Funktion:

- aktuellen Teststatus anzeigen
- klare Aussage: lokal testbar plus, noch nicht live mit KI-Modell
- Testfragen anzeigen
- richtige Testseite /cmt/ask anzeigen
- naechsten Meilenstein master-router anzeigen

Status:

- lokal testbar plus
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v119-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask-status.ts', 'getCommitteeAskStatus'],
  ['frontend/lib/cmt-ask-status.ts', "phase: '119.2'"],
  ['frontend/lib/cmt-ask-status.ts', "label: 'Gremium Ask Status'"],
  ['frontend/lib/cmt-ask-status.ts', "currentMode: 'local-testable-plus'"],
  ['frontend/lib/cmt-ask-status.ts', 'usesFiveMemberCommittee: true'],
  ['frontend/lib/cmt-ask-status.ts', 'questionIntentDetection: true'],
  ['frontend/lib/cmt-ask-status.ts', 'liveModelEnabled: false'],
  ['frontend/lib/cmt-ask-status.ts', "nextMilestone: 'master-router'"],
  ['frontend/lib/cmt-ask-status.ts', "openPage: '/cmt/ask'"],
  ['frontend/app/api/cmt/ask/status/route.ts', 'getCommitteeAskStatus'],
  ['frontend/app/cmt/ask/status/page.tsx', 'Phase 119.2'],
  ['frontend/app/cmt/ask/status/page.tsx', 'Empfohlene Testfragen'],
  ['README_PHASE119_2.md', 'Gremium Ask Status'],
  ['package.json', 'phase119:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.2 Gremium Ask Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase119:2:verify'] = 'node scripts/v119-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 119.2 Gremium Ask Status patch applied.');
