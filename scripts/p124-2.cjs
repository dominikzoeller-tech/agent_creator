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

write('frontend/lib/cmt-master-quality-entry.ts', `import { getSecureMasterQualityStatus, type SecureMasterQualityStatus } from './cmt-master-quality-status';

export type SecureMasterQualityEntry = {
  phase: '124.2';
  label: 'Secure Master Quality Entry';
  status: SecureMasterQualityStatus;
  primaryQualityPage: '/cmt/master/secure/quality';
  qualityStatusPage: '/cmt/master/secure/quality/status';
  secureMasterPage: '/cmt/master/secure';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterQualityEntry(): SecureMasterQualityEntry {
  return {
    phase: '124.2',
    label: 'Secure Master Quality Entry',
    status: getSecureMasterQualityStatus(),
    primaryQualityPage: '/cmt/master/secure/quality',
    qualityStatusPage: '/cmt/master/secure/quality/status',
    secureMasterPage: '/cmt/master/secure',
    recommendedUse: [
      'Quality-Seite fuer lokale Antworttests verwenden.',
      'Secure-Master-Hauptseite weiter als zentralen Einstieg behalten.',
      'Bei internen Daten Privacy Gate pruefen.',
      'Bei Entscheidungsfragen Gremium-Routing testen.',
      'Bei Live-Daten Toolbedarf sauber erkennen lassen.',
    ],
    sampleQuestions: [
      'Was kannst du als Master-Agent aktuell?',
      'Soll ich den Agenten live schalten?',
      'Hier sind interne Daten von Kunde Muster. Darfst du das extern verarbeiten?',
      'Soll ich das Gremium fragen?',
      'Wie ist das Wetter morgen?',
      'Baue mir einen Immobilien-Agenten.',
    ],
    safety: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 124.3: Secure Master Quality Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/quality/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterQualityEntry } from '../../../../../../../lib/cmt-master-quality-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterQualityEntry());
}
`);

write('frontend/app/cmt/master/secure/quality/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterQualityEntry } from '../../../../../../lib/cmt-master-quality-entry';

export default function SecureMasterQualityEntryPage() {
  const entry = getSecureMasterQualityEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 124.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Lokale Antwortqualitaet ist testbar. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryQualityPage}>Quality-Testseite</Link></li>
          <li><Link href={entry.qualityStatusPage}>Quality-Status</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
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

write('README_PHASE124_2.md', `# Phase 124.2 - Secure Master Quality Entry

Baut eine Einstiegsseite fuer die lokale Antwortqualitaet des Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-quality-entry.ts
- API: /api/cmt/master/secure/quality/entry
- UI: /cmt/master/secure/quality/entry
- Patch: scripts/p124-2.cjs
- Verify: scripts/v124-2.cjs

Hauptseiten:

- /cmt/master/secure/quality
- /cmt/master/secure/quality/status
- /cmt/master/secure

Status:

- lokal testbar
- Antwortqualitaet verbessert
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v124-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality-entry.ts', 'getSecureMasterQualityEntry'],
  ['frontend/lib/cmt-master-quality-entry.ts', "phase: '124.2'"],
  ['frontend/lib/cmt-master-quality-entry.ts', "primaryQualityPage: '/cmt/master/secure/quality'"],
  ['frontend/lib/cmt-master-quality-entry.ts', "qualityStatusPage: '/cmt/master/secure/quality/status'"],
  ['frontend/lib/cmt-master-quality-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/quality/entry/route.ts', 'getSecureMasterQualityEntry'],
  ['frontend/app/cmt/master/secure/quality/entry/page.tsx', 'Quality-Testseite'],
  ['frontend/app/cmt/master/secure/quality/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE124_2.md', 'Secure Master Quality Entry'],
  ['package.json', 'phase124:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.2 Secure Master Quality Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase124:2:verify'] = 'node scripts/v124-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 124.2 Secure Master Quality Entry patch applied.');
