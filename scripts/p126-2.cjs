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

write('frontend/lib/cmt-master-unified-entry.ts', `import { getSecureMasterUnifiedStatus, type SecureMasterUnifiedStatus } from './cmt-master-unified-status';

export type SecureMasterUnifiedEntry = {
  phase: '126.2';
  label: 'Secure Master Unified Entry';
  status: SecureMasterUnifiedStatus;
  primaryUnifiedPage: '/cmt/master/secure/unified';
  unifiedStatusPage: '/cmt/master/secure/unified/status';
  secureMasterPage: '/cmt/master/secure';
  committeePage: '/cmt/master/secure/committee';
  qualityPage: '/cmt/master/secure/quality';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    unifiedFlowVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterUnifiedEntry(): SecureMasterUnifiedEntry {
  return {
    phase: '126.2',
    label: 'Secure Master Unified Entry',
    status: getSecureMasterUnifiedStatus(),
    primaryUnifiedPage: '/cmt/master/secure/unified',
    unifiedStatusPage: '/cmt/master/secure/unified/status',
    secureMasterPage: '/cmt/master/secure',
    committeePage: '/cmt/master/secure/committee',
    qualityPage: '/cmt/master/secure/quality',
    recommendedUse: [
      'Unified-Seite fuer zentrale lokale Tests verwenden.',
      'Secure-Master-Hauptseite bleibt der spaetere zentrale Einstieg.',
      'Quality- und Committee-Seiten als Kontrollseiten behalten.',
      'Bei internen Daten Privacy Gate Verhalten pruefen.',
      'Bei Entscheidungsfragen Gremiumsausgabe im Unified Flow pruefen.',
      'Keine Live-Schaltung ohne separate Freigabe.',
    ],
    sampleQuestions: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Daten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    safety: {
      localTestable: true,
      unifiedFlowVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 126.3: Secure Master Unified Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/unified/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterUnifiedEntry } from '../../../../../../../lib/cmt-master-unified-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterUnifiedEntry());
}
`);

write('frontend/app/cmt/master/secure/unified/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterUnifiedEntry } from '../../../../../../lib/cmt-master-unified-entry';

export default function SecureMasterUnifiedEntryPage() {
  const entry = getSecureMasterUnifiedEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 126.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Unified Flow lokal testbar. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryUnifiedPage}>Unified-Testseite</Link></li>
          <li><Link href={entry.unifiedStatusPage}>Unified-Status</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
          <li><Link href={entry.committeePage}>Committee-Testseite</Link></li>
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
          <li>unifiedFlowVisible: {String(entry.safety.unifiedFlowVisible)}</li>
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

write('README_PHASE126_2.md', `# Phase 126.2 - Secure Master Unified Entry

Baut eine Einstiegsseite fuer den Secure Master Unified Main Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-master-unified-entry.ts
- API: /api/cmt/master/secure/unified/entry
- UI: /cmt/master/secure/unified/entry
- Patch: scripts/p126-2.cjs
- Verify: scripts/v126-2.cjs

Hauptseiten:

- /cmt/master/secure/unified
- /cmt/master/secure/unified/status
- /cmt/master/secure/unified/entry
- /cmt/master/secure

Status:

- lokal testbar
- Unified Flow sichtbar
- Quality-Antwort sichtbar
- Gremium bei Bedarf sichtbar
- Privacy Gate bei Bedarf sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v126-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified-entry.ts', 'getSecureMasterUnifiedEntry'],
  ['frontend/lib/cmt-master-unified-entry.ts', "phase: '126.2'"],
  ['frontend/lib/cmt-master-unified-entry.ts', "primaryUnifiedPage: '/cmt/master/secure/unified'"],
  ['frontend/lib/cmt-master-unified-entry.ts', "unifiedStatusPage: '/cmt/master/secure/unified/status'"],
  ['frontend/lib/cmt-master-unified-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/unified/entry/route.ts', 'getSecureMasterUnifiedEntry'],
  ['frontend/app/cmt/master/secure/unified/entry/page.tsx', 'Unified-Testseite'],
  ['frontend/app/cmt/master/secure/unified/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE126_2.md', 'Secure Master Unified Entry'],
  ['package.json', 'phase126:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.2 Secure Master Unified Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase126:2:verify'] = 'node scripts/v126-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 126.2 Secure Master Unified Entry patch applied.');
