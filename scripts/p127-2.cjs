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

write('frontend/lib/cmt-master-main-entry.ts', `import { getSecureMasterMainStatus, type SecureMasterMainStatus } from './cmt-master-main-status';

export type SecureMasterMainEntry = {
  phase: '127.2';
  label: 'Secure Master Main View Entry';
  status: SecureMasterMainStatus;
  primaryMainPage: '/cmt/master/secure';
  mainStatusPage: '/cmt/master/secure/main/status';
  unifiedControlPage: '/cmt/master/secure/unified';
  visibleControlPages: string[];
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    mainPageUsesUnifiedFlow: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterMainEntry(): SecureMasterMainEntry {
  return {
    phase: '127.2',
    label: 'Secure Master Main View Entry',
    status: getSecureMasterMainStatus(),
    primaryMainPage: '/cmt/master/secure',
    mainStatusPage: '/cmt/master/secure/main/status',
    unifiedControlPage: '/cmt/master/secure/unified',
    visibleControlPages: [
      '/cmt/master/secure/main/status',
      '/cmt/master/secure/unified',
      '/cmt/master/secure/unified/status',
      '/cmt/master/secure/unified/entry',
      '/cmt/master/secure/quality',
      '/cmt/master/secure/committee',
      '/cmt/privacy',
    ],
    recommendedUse: [
      'Hauptseite /cmt/master/secure fuer normale lokale Tests verwenden.',
      'Statusseite nur zur Kontrolle verwenden.',
      'Unified-Kontrollseite nur bei Vergleich oder Debugging verwenden.',
      'Bei internen Daten das Privacy Gate Verhalten pruefen.',
      'Bei Entscheidungsfragen die Gremiumsausgabe direkt auf der Hauptseite pruefen.',
      'Provider, Internet und Live-Modell weiterhin deaktiviert lassen.',
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
      mainPageUsesUnifiedFlow: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 127.3: Secure Master Main View Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterMainEntry } from '../../../../../../../lib/cmt-master-main-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterMainEntry());
}
`);

write('frontend/app/cmt/master/secure/main/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterMainEntry } from '../../../../../../lib/cmt-master-main-entry';

export default function SecureMasterMainEntryPage() {
  const entry = getSecureMasterMainEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 127.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Hauptseite nutzt Unified Flow. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainPage}>Secure Master Hauptseite</Link></li>
          <li><Link href={entry.mainStatusPage}>Main Status</Link></li>
          <li><Link href={entry.unifiedControlPage}>Unified Kontrollseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>{entry.visibleControlPages.map((href) => <li key={href}><Link href={href}>{href}</Link></li>)}</ul>
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
          <li>mainPageUsesUnifiedFlow: {String(entry.safety.mainPageUsesUnifiedFlow)}</li>
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

write('README_PHASE127_2.md', `# Phase 127.2 - Secure Master Main View Entry

Baut eine Einstiegsseite fuer die neue Hauptansicht /cmt/master/secure.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-entry.ts
- API: /api/cmt/master/secure/main/entry
- UI: /cmt/master/secure/main/entry
- Patch: scripts/p127-2.cjs
- Verify: scripts/v127-2.cjs

Hauptseite:

- /cmt/master/secure

Entry-Seite:

- /cmt/master/secure/main/entry

Status:

- lokal testbar
- Hauptseite nutzt Unified Flow
- lokale Antwort sichtbar
- Routing sichtbar
- Privacy Gate bei Bedarf sichtbar
- 5er-Gremium bei Bedarf sichtbar
- Safety State sichtbar
- Kontrollseiten bleiben erhalten
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v127-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-entry.ts', 'getSecureMasterMainEntry'],
  ['frontend/lib/cmt-master-main-entry.ts', "phase: '127.2'"],
  ['frontend/lib/cmt-master-main-entry.ts', "primaryMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-entry.ts', 'mainPageUsesUnifiedFlow: true'],
  ['frontend/lib/cmt-master-main-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/entry/route.ts', 'getSecureMasterMainEntry'],
  ['frontend/app/cmt/master/secure/main/entry/page.tsx', 'Secure Master Hauptseite'],
  ['frontend/app/cmt/master/secure/main/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE127_2.md', 'Secure Master Main View Entry'],
  ['package.json', 'phase127:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.2 Secure Master Main View Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase127:2:verify'] = 'node scripts/v127-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 127.2 Secure Master Main View Entry patch applied.');
