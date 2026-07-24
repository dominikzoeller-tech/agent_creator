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

write('frontend/lib/cmt-master-answer-log-status.ts', `import { getSecureMasterAnswerLogDemo, type SecureMasterAnswerLogResult } from './cmt-master-answer-log';

export type SecureMasterAnswerLogStatus = {
  phase: '129.1';
  label: 'Secure Master Local Answer Log Status';
  logPage: '/cmt/master/secure/main/log';
  logApi: '/api/cmt/master/secure/main/log';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogResult;
  logState: {
    localLogObjectVisible: true;
    inputPreviewVisible: true;
    intentVisible: true;
    routeVisible: true;
    privacyDecisionVisible: true;
    badgesVisible: true;
    safetyStateVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleFields: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterAnswerLogStatus(): SecureMasterAnswerLogStatus {
  return {
    phase: '129.1',
    label: 'Secure Master Local Answer Log Status',
    logPage: '/cmt/master/secure/main/log',
    logApi: '/api/cmt/master/secure/main/log',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogDemo(),
    logState: {
      localLogObjectVisible: true,
      inputPreviewVisible: true,
      intentVisible: true,
      routeVisible: true,
      privacyDecisionVisible: true,
      badgesVisible: true,
      safetyStateVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Das lokale Antwortprotokoll erzeugt pro Anfrage ein Log-Objekt mit Input-Preview, Intent, Route, Privacy-Entscheidung, Badges und Safety State. Es wird noch nicht dauerhaft gespeichert.',
    },
    visibleFields: [
      'id',
      'createdAt',
      'inputPreview',
      'option',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary',
      'safety',
      'persistence flags',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Answer Log Entry ergaenzen',
      'lokale In-Memory-Liste fuer mehrere Logs vorbereiten',
      'Logliste auf eigener Seite anzeigen',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogStatus } from '../../../../../../../../lib/cmt-master-answer-log-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogStatus } from '../../../../../../../lib/cmt-master-answer-log-status';

export default function SecureMasterAnswerLogStatusPage() {
  const status = getSecureMasterAnswerLogStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 129.1</h1>
        <h2>{status.label}</h2>
        <p>{status.logState.summary}</p>
        <p><Link href={status.logPage}>Answer Log öffnen</Link></p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Log State</h3>
        <ul>
          <li>localLogObjectVisible: {String(status.logState.localLogObjectVisible)}</li>
          <li>inputPreviewVisible: {String(status.logState.inputPreviewVisible)}</li>
          <li>intentVisible: {String(status.logState.intentVisible)}</li>
          <li>routeVisible: {String(status.logState.routeVisible)}</li>
          <li>privacyDecisionVisible: {String(status.logState.privacyDecisionVisible)}</li>
          <li>badgesVisible: {String(status.logState.badgesVisible)}</li>
          <li>safetyStateVisible: {String(status.logState.safetyStateVisible)}</li>
          <li>persistedInBrowser: {String(status.logState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.logState.persistedOnServer)}</li>
          <li>localOnly: {String(status.logState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.logState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.logState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.logState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.logState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>id: {status.demo.entry.id}</li>
          <li>detectedIntent: {status.demo.entry.detectedIntent}</li>
          <li>finalRoute: {status.demo.entry.finalRoute}</li>
          <li>privacyDecision: {status.demo.entry.privacyDecision}</li>
          <li>badgeSummary: {status.demo.entry.badgeSummary.length}</li>
          <li>persistedInBrowser: {String(status.demo.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.demo.persistedOnServer)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE129_1.md', `# Phase 129.1 - Secure Master Local Answer Log Status

Baut eine Statusseite fuer das lokale Antwortprotokoll.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-status.ts
- API: /api/cmt/master/secure/main/log/status
- UI: /cmt/master/secure/main/log/status
- Patch: scripts/p129-1.cjs
- Verify: scripts/v129-1.cjs

Hauptseiten:

- /cmt/master/secure/main/log
- /cmt/master/secure/main/log/status
- /cmt/master/secure

Status:

- lokal testbar
- Log-Objekt sichtbar
- Input-Preview sichtbar
- Intent sichtbar
- Route sichtbar
- Privacy-Entscheidung sichtbar
- Badges sichtbar
- Safety State sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v129-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-status.ts', 'getSecureMasterAnswerLogStatus'],
  ['frontend/lib/cmt-master-answer-log-status.ts', "phase: '129.1'"],
  ['frontend/lib/cmt-master-answer-log-status.ts', "logPage: '/cmt/master/secure/main/log'"],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'localLogObjectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/status/route.ts', 'getSecureMasterAnswerLogStatus'],
  ['frontend/app/cmt/master/secure/main/log/status/page.tsx', 'Log State'],
  ['frontend/app/cmt/master/secure/main/log/status/page.tsx', 'Sichtbare Felder'],
  ['README_PHASE129_1.md', 'Secure Master Local Answer Log Status'],
  ['package.json', 'phase129:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.1 Secure Master Local Answer Log Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase129:1:verify'] = 'node scripts/v129-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 129.1 Secure Master Local Answer Log Status patch applied.');
