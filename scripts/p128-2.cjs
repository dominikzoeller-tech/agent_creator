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

write('frontend/lib/cmt-master-main-view-entry.ts', `import { getSecureMasterMainViewStatus, type SecureMasterMainViewStatus } from './cmt-master-main-view-status';

export type SecureMasterMainViewEntry = {
  phase: '128.2';
  label: 'Secure Master Structured Main View Entry';
  status: SecureMasterMainViewStatus;
  primaryMainPage: '/cmt/master/secure';
  structuredStatusPage: '/cmt/master/secure/main/view/status';
  mainViewApi: '/api/cmt/master/secure/main/view';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleFeatures: string[];
  safety: {
    localTestable: true;
    structuredMainViewVisible: true;
    statusBadgesVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterMainViewEntry(): SecureMasterMainViewEntry {
  return {
    phase: '128.2',
    label: 'Secure Master Structured Main View Entry',
    status: getSecureMasterMainViewStatus(),
    primaryMainPage: '/cmt/master/secure',
    structuredStatusPage: '/cmt/master/secure/main/view/status',
    mainViewApi: '/api/cmt/master/secure/main/view',
    recommendedUse: [
      'Hauptseite /cmt/master/secure als Standard-Testseite nutzen.',
      'Status-Badges nach jeder Frage pruefen.',
      'Bei internen Daten Privacy Gate und External-Sharing-Badge pruefen.',
      'Bei Entscheidungsfragen Gremiumskarten pruefen.',
      'Structured-Statusseite nur zur Kontrolle nutzen.',
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
    visibleFeatures: [
      'Structured Main View',
      'Status-Badges',
      'Kompakte Antwortbloecke',
      '5er-Gremium-Karten bei Bedarf',
      'Kontrollseiten-Links',
      'Safety State',
    ],
    safety: {
      localTestable: true,
      structuredMainViewVisible: true,
      statusBadgesVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 128.3: Secure Master Structured Main View Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/view/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterMainViewEntry } from '../../../../../../../../lib/cmt-master-main-view-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterMainViewEntry());
}
`);

write('frontend/app/cmt/master/secure/main/view/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterMainViewEntry } from '../../../../../../../lib/cmt-master-main-view-entry';

export default function SecureMasterMainViewEntryPage() {
  const entry = getSecureMasterMainViewEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 128.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Strukturierte Hauptansicht ist lokal testbar. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainPage}>Secure Master Hauptseite</Link></li>
          <li><Link href={entry.structuredStatusPage}>Structured Main View Status</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Visible Features</h3>
        <ul>{entry.visibleFeatures.map((item) => <li key={item}>{item}</li>)}</ul>
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
          <li>structuredMainViewVisible: {String(entry.safety.structuredMainViewVisible)}</li>
          <li>statusBadgesVisible: {String(entry.safety.statusBadgesVisible)}</li>
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

write('README_PHASE128_2.md', `# Phase 128.2 - Secure Master Structured Main View Entry

Baut eine Entry-Seite fuer die strukturierte Secure-Master-Hauptansicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-view-entry.ts
- API: /api/cmt/master/secure/main/view/entry
- UI: /cmt/master/secure/main/view/entry
- Patch: scripts/p128-2.cjs
- Verify: scripts/v128-2.cjs

Hauptseite:

- /cmt/master/secure

Entry-Seite:

- /cmt/master/secure/main/view/entry

Status:

- lokal testbar
- strukturierte Hauptansicht sichtbar
- Status-Badges sichtbar
- kompakte Antwortbloecke sichtbar
- Gremiumskarten lesbarer
- Kontrolllinks sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v128-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-entry.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/lib/cmt-master-main-view-entry.ts', "phase: '128.2'"],
  ['frontend/lib/cmt-master-main-view-entry.ts', "primaryMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'statusBadgesVisible: true'],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/view/entry/route.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/app/cmt/master/secure/main/view/entry/page.tsx', 'Visible Features'],
  ['frontend/app/cmt/master/secure/main/view/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE128_2.md', 'Secure Master Structured Main View Entry'],
  ['package.json', 'phase128:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.2 Secure Master Structured Main View Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase128:2:verify'] = 'node scripts/v128-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 128.2 Secure Master Structured Main View Entry patch applied.');
