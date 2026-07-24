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

write('frontend/lib/cmt-master-answer-log-entry.ts', `import { getSecureMasterAnswerLogStatus, type SecureMasterAnswerLogStatus } from './cmt-master-answer-log-status';

export type SecureMasterAnswerLogEntryInfo = {
  phase: '129.2';
  label: 'Secure Master Local Answer Log Entry';
  status: SecureMasterAnswerLogStatus;
  primaryLogPage: '/cmt/master/secure/main/log';
  logStatusPage: '/cmt/master/secure/main/log/status';
  mainPage: '/cmt/master/secure';
  logApi: '/api/cmt/master/secure/main/log';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleLogFields: string[];
  safety: {
    localTestable: true;
    answerLogVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogEntry(): SecureMasterAnswerLogEntryInfo {
  return {
    phase: '129.2',
    label: 'Secure Master Local Answer Log Entry',
    status: getSecureMasterAnswerLogStatus(),
    primaryLogPage: '/cmt/master/secure/main/log',
    logStatusPage: '/cmt/master/secure/main/log/status',
    mainPage: '/cmt/master/secure',
    logApi: '/api/cmt/master/secure/main/log',
    recommendedUse: [
      'Answer-Log-Seite fuer einzelne lokale Protokollobjekte verwenden.',
      'Statusseite zur Kontrolle der sichtbaren Felder nutzen.',
      'Bei internen Daten Privacy-Entscheidung und Safety State pruefen.',
      'Bei Entscheidungsfragen Badge Summary und Gremiumsergebnis pruefen.',
      'Noch keine dauerhafte Speicherung erwarten.',
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
    visibleLogFields: [
      'id',
      'createdAt',
      'inputPreview',
      'option',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary',
      'safety',
      'localOnly',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      answerLogVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 129.3: Secure Master Local Answer Log Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogEntry } from '../../../../../../../../lib/cmt-master-answer-log-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogEntry } from '../../../../../../../lib/cmt-master-answer-log-entry';

export default function SecureMasterAnswerLogEntryPage() {
  const entry = getSecureMasterAnswerLogEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 129.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Lokales Antwortprotokoll ist sichtbar. Noch keine dauerhafte Speicherung.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryLogPage}>Answer Log</Link></li>
          <li><Link href={entry.logStatusPage}>Answer Log Status</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Log-Felder</h3>
        <ul>{entry.visibleLogFields.map((item) => <li key={item}>{item}</li>)}</ul>
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
          <li>answerLogVisible: {String(entry.safety.answerLogVisible)}</li>
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

write('README_PHASE129_2.md', `# Phase 129.2 - Secure Master Local Answer Log Entry

Baut eine Entry-Seite fuer das lokale Antwortprotokoll.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-entry.ts
- API: /api/cmt/master/secure/main/log/entry
- UI: /cmt/master/secure/main/log/entry
- Patch: scripts/p129-2.cjs
- Verify: scripts/v129-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log
- /cmt/master/secure/main/log/status
- /cmt/master/secure/main/log/entry
- /cmt/master/secure

Status:

- lokal testbar
- Answer-Log-Entry sichtbar
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

write('scripts/v129-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'getSecureMasterAnswerLogEntry'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', "phase: '129.2'"],
  ['frontend/lib/cmt-master-answer-log-entry.ts', "primaryLogPage: '/cmt/master/secure/main/log'"],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'answerLogVisible: true'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/entry/route.ts', 'getSecureMasterAnswerLogEntry'],
  ['frontend/app/cmt/master/secure/main/log/entry/page.tsx', 'Sichtbare Log-Felder'],
  ['frontend/app/cmt/master/secure/main/log/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE129_2.md', 'Secure Master Local Answer Log Entry'],
  ['package.json', 'phase129:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.2 Secure Master Local Answer Log Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase129:2:verify'] = 'node scripts/v129-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 129.2 Secure Master Local Answer Log Entry patch applied.');
