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

write('frontend/lib/cmt-master-committee-entry.ts', `import { getSecureMasterCommitteeStatus, type SecureMasterCommitteeStatus } from './cmt-master-committee-status';

export type SecureMasterCommitteeEntry = {
  phase: '125.2';
  label: 'Secure Master Committee Entry';
  status: SecureMasterCommitteeStatus;
  primaryCommitteePage: '/cmt/master/secure/committee';
  committeeStatusPage: '/cmt/master/secure/committee/status';
  secureMasterPage: '/cmt/master/secure';
  qualityPage: '/cmt/master/secure/quality';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    fiveRolesVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterCommitteeEntry(): SecureMasterCommitteeEntry {
  return {
    phase: '125.2',
    label: 'Secure Master Committee Entry',
    status: getSecureMasterCommitteeStatus(),
    primaryCommitteePage: '/cmt/master/secure/committee',
    committeeStatusPage: '/cmt/master/secure/committee/status',
    secureMasterPage: '/cmt/master/secure',
    qualityPage: '/cmt/master/secure/quality',
    recommendedUse: [
      'Committee-Seite fuer Entscheidungsfragen verwenden.',
      'Bei Gremiumsfragen die 5 Rollen und finale Empfehlung pruefen.',
      'Bei internen Daten weiterhin Privacy Gate beachten.',
      'Bei Live-Schaltung immer lokale Tests und separate Freigabe priorisieren.',
      'Secure-Master-Hauptseite bleibt zentraler Einstieg.',
    ],
    sampleQuestions: [
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Welche Risiken hat die naechste Projektphase?',
      'Soll ich Provider vorbereiten oder lokal weiter testen?',
      'Wie bewertet das Gremium interne Kundendaten?',
    ],
    safety: {
      localTestable: true,
      fiveRolesVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 125.3: Secure Master Committee Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/committee/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterCommitteeEntry } from '../../../../../../../lib/cmt-master-committee-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeEntry());
}
`);

write('frontend/app/cmt/master/secure/committee/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterCommitteeEntry } from '../../../../../../lib/cmt-master-committee-entry';

export default function SecureMasterCommitteeEntryPage() {
  const entry = getSecureMasterCommitteeEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 125.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> 5er-Gremium lokal testbar. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryCommitteePage}>Committee-Testseite</Link></li>
          <li><Link href={entry.committeeStatusPage}>Committee-Status</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
          <li><Link href={entry.qualityPage}>Quality-Testseite</Link></li>
        </ul>
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
          <li>fiveRolesVisible: {String(entry.safety.fiveRolesVisible)}</li>
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

write('README_PHASE125_2.md', `# Phase 125.2 - Secure Master Committee Entry

Baut eine Einstiegsseite fuer die 5er-Gremium-Integration im Secure Master.

Kurz-Namen:

- Store: frontend/lib/cmt-master-committee-entry.ts
- API: /api/cmt/master/secure/committee/entry
- UI: /cmt/master/secure/committee/entry
- Patch: scripts/p125-2.cjs
- Verify: scripts/v125-2.cjs

Hauptseiten:

- /cmt/master/secure/committee
- /cmt/master/secure/committee/status
- /cmt/master/secure/committee/entry
- /cmt/master/secure

Status:

- lokal testbar
- 5er-Gremium sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v125-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee-entry.ts', 'getSecureMasterCommitteeEntry'],
  ['frontend/lib/cmt-master-committee-entry.ts', "phase: '125.2'"],
  ['frontend/lib/cmt-master-committee-entry.ts', "primaryCommitteePage: '/cmt/master/secure/committee'"],
  ['frontend/lib/cmt-master-committee-entry.ts', "committeeStatusPage: '/cmt/master/secure/committee/status'"],
  ['frontend/lib/cmt-master-committee-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/committee/entry/route.ts', 'getSecureMasterCommitteeEntry'],
  ['frontend/app/cmt/master/secure/committee/entry/page.tsx', 'Committee-Testseite'],
  ['frontend/app/cmt/master/secure/committee/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE125_2.md', 'Secure Master Committee Entry'],
  ['package.json', 'phase125:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.2 Secure Master Committee Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase125:2:verify'] = 'node scripts/v125-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 125.2 Secure Master Committee Entry patch applied.');
