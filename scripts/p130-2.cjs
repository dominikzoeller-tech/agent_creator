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

write('frontend/lib/cmt-master-answer-log-list-entry.ts', `import { getSecureMasterAnswerLogListStatus, type SecureMasterAnswerLogListStatus } from './cmt-master-answer-log-list-status';

export type SecureMasterAnswerLogListEntry = {
  phase: '130.2';
  label: 'Secure Master In-Memory Answer Log List Entry';
  status: SecureMasterAnswerLogListStatus;
  primaryListPage: '/cmt/master/secure/main/log/list';
  listStatusPage: '/cmt/master/secure/main/log/list/status';
  singleLogPage: '/cmt/master/secure/main/log';
  mainPage: '/cmt/master/secure';
  listApi: '/api/cmt/master/secure/main/log/list';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleListFields: string[];
  safety: {
    localTestable: true;
    inMemoryListVisible: true;
    multipleLogsVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListEntry(): SecureMasterAnswerLogListEntry {
  return {
    phase: '130.2',
    label: 'Secure Master In-Memory Answer Log List Entry',
    status: getSecureMasterAnswerLogListStatus(),
    primaryListPage: '/cmt/master/secure/main/log/list',
    listStatusPage: '/cmt/master/secure/main/log/list/status',
    singleLogPage: '/cmt/master/secure/main/log',
    mainPage: '/cmt/master/secure',
    listApi: '/api/cmt/master/secure/main/log/list',
    recommendedUse: [
      'Loglisten-Seite fuer mehrere lokale Protokollobjekte verwenden.',
      'Statusseite zur Kontrolle der In-Memory-List verwenden.',
      'Einzel-Log-Seite als Detail-Kontrollseite behalten.',
      'Bei internen Daten Privacy-Entscheidung und Safety State pruefen.',
      'Noch keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    sampleQuestions: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    visibleListFields: [
      'count',
      'id',
      'createdAt',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      inMemoryListVisible: true,
      multipleLogsVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 130.3: Secure Master In-Memory Answer Log List Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-entry';

export default function SecureMasterAnswerLogListEntryPage() {
  const entry = getSecureMasterAnswerLogListEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 130.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> In-Memory-Logliste ist sichtbar. Noch keine dauerhafte Speicherung.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryListPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.listStatusPage}>Loglisten-Status</Link></li>
          <li><Link href={entry.singleLogPage}>Einzelnes Answer Log</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Listen-Felder</h3>
        <ul>{entry.visibleListFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sample Questions</h3>
        <ol>{entry.sampleQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.safety.localTestable)}</li>
          <li>inMemoryListVisible: {String(entry.safety.inMemoryListVisible)}</li>
          <li>multipleLogsVisible: {String(entry.safety.multipleLogsVisible)}</li>
          <li>persistedInBrowser: {String(entry.safety.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(entry.safety.persistedOnServer)}</li>
          <li>liveModelEnabled: {String(entry.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE130_2.md', `# Phase 130.2 - Secure Master In-Memory Answer Log List Entry

Baut eine Entry-Seite fuer die lokale In-Memory-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-entry.ts
- API: /api/cmt/master/secure/main/log/list/entry
- UI: /cmt/master/secure/main/log/list/entry
- Patch: scripts/p130-2.cjs
- Verify: scripts/v130-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/status
- /cmt/master/secure/main/log/list/entry
- /cmt/master/secure/main/log
- /cmt/master/secure

Status:

- lokal testbar
- Loglist-Entry sichtbar
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

write('scripts/v130-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'getSecureMasterAnswerLogListEntry'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', "phase: '130.2'"],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', "primaryListPage: '/cmt/master/secure/main/log/list'"],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'inMemoryListVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'multipleLogsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/entry/route.ts', 'getSecureMasterAnswerLogListEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/entry/page.tsx', 'Sichtbare Listen-Felder'],
  ['README_PHASE130_2.md', 'Secure Master In-Memory Answer Log List Entry'],
  ['package.json', 'phase130:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.2 Secure Master In-Memory Answer Log List Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase130:2:verify'] = 'node scripts/v130-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 130.2 Secure Master In-Memory Answer Log List Entry patch applied.');
