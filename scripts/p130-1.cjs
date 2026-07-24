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

write('frontend/lib/cmt-master-answer-log-list-status.ts', `import { getSecureMasterAnswerLogListDemo, type SecureMasterAnswerLogListResult } from './cmt-master-answer-log-list';

export type SecureMasterAnswerLogListStatus = {
  phase: '130.1';
  label: 'Secure Master In-Memory Answer Log List Status';
  listPage: '/cmt/master/secure/main/log/list';
  listApi: '/api/cmt/master/secure/main/log/list';
  singleLogPage: '/cmt/master/secure/main/log';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogListResult;
  listState: {
    inMemoryListVisible: true;
    multipleLogsVisible: true;
    countVisible: true;
    itemFieldsVisible: true;
    usesSingleLogStore: true;
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

export function getSecureMasterAnswerLogListStatus(): SecureMasterAnswerLogListStatus {
  return {
    phase: '130.1',
    label: 'Secure Master In-Memory Answer Log List Status',
    listPage: '/cmt/master/secure/main/log/list',
    listApi: '/api/cmt/master/secure/main/log/list',
    singleLogPage: '/cmt/master/secure/main/log',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogListDemo(),
    listState: {
      inMemoryListVisible: true,
      multipleLogsVisible: true,
      countVisible: true,
      itemFieldsVisible: true,
      usesSingleLogStore: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale In-Memory-Logliste zeigt mehrere Secure-Master-Logobjekte. Die Liste nutzt das bestehende Einzel-Log, speichert aber nichts dauerhaft.',
    },
    visibleFields: [
      'count',
      'id',
      'createdAt',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary',
      'safety.finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
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
      'Loglist Entry ergaenzen',
      'Loglist Handoff ergaenzen',
      'optionale Filter/Suche vorbereiten',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-status';

export default function SecureMasterAnswerLogListStatusPage() {
  const status = getSecureMasterAnswerLogListStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 130.1</h1>
        <h2>{status.label}</h2>
        <p>{status.listState.summary}</p>
        <p><Link href={status.listPage}>In-Memory-Logliste öffnen</Link></p>
        <p><Link href={status.singleLogPage}>Einzelnes Answer Log öffnen</Link></p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>List State</h3>
        <ul>
          <li>inMemoryListVisible: {String(status.listState.inMemoryListVisible)}</li>
          <li>multipleLogsVisible: {String(status.listState.multipleLogsVisible)}</li>
          <li>countVisible: {String(status.listState.countVisible)}</li>
          <li>itemFieldsVisible: {String(status.listState.itemFieldsVisible)}</li>
          <li>usesSingleLogStore: {String(status.listState.usesSingleLogStore)}</li>
          <li>persistedInBrowser: {String(status.listState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.listState.persistedOnServer)}</li>
          <li>localOnly: {String(status.listState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.listState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.listState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.listState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.listState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>count: {status.demo.count}</li>
          <li>persistedInBrowser: {String(status.demo.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.demo.persistedOnServer)}</li>
          <li>externalSharingAllowed: {String(status.demo.safety.externalSharingAllowed)}</li>
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

write('README_PHASE130_1.md', `# Phase 130.1 - Secure Master In-Memory Answer Log List Status

Baut eine Statusseite fuer die lokale In-Memory-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-status.ts
- API: /api/cmt/master/secure/main/log/list/status
- UI: /cmt/master/secure/main/log/list/status
- Patch: scripts/p130-1.cjs
- Verify: scripts/v130-1.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/status
- /cmt/master/secure/main/log
- /cmt/master/secure

Status:

- lokal testbar
- In-Memory-Logliste sichtbar
- mehrere Logs sichtbar
- Count sichtbar
- Item-Felder sichtbar
- nutzt bestehendes Einzel-Log
- persistedInBrowser = false
- persistedOnServer = false
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v130-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', "phase: '130.1'"],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', "listPage: '/cmt/master/secure/main/log/list'"],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'inMemoryListVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'multipleLogsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/status/route.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/status/page.tsx', 'List State'],
  ['README_PHASE130_1.md', 'Secure Master In-Memory Answer Log List Status'],
  ['package.json', 'phase130:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.1 Secure Master In-Memory Answer Log List Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase130:1:verify'] = 'node scripts/v130-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 130.1 Secure Master In-Memory Answer Log List Status patch applied.');
