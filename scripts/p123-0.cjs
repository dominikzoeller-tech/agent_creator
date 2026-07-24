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

write('frontend/lib/cmt-master-home.ts', `export type SecureMasterHome = {
  phase: '123.0';
  label: 'Secure Master Home Entry';
  primaryEntry: '/cmt/master/secure';
  statusEntry: '/cmt/master/secure/status';
  guideEntry: '/cmt/master/secure/guide';
  relatedEntries: {
    privacy: '/cmt/privacy';
    privacyDecision: '/cmt/privacy/decision';
    committeeAsk: '/cmt/ask';
  };
  status: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    mainMessage: string;
  };
  recommendedTestQuestions: string[];
  nextMilestone: string;
};

export function getSecureMasterHome(): SecureMasterHome {
  return {
    phase: '123.0',
    label: 'Secure Master Home Entry',
    primaryEntry: '/cmt/master/secure',
    statusEntry: '/cmt/master/secure/status',
    guideEntry: '/cmt/master/secure/guide',
    relatedEntries: {
      privacy: '/cmt/privacy',
      privacyDecision: '/cmt/privacy/decision',
      committeeAsk: '/cmt/ask',
    },
    status: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      mainMessage: 'Der Secure Master Agent ist der aktuelle Haupt-Testpunkt. Noch nicht live mit KI-Modell.',
    },
    recommendedTestQuestions: [
      'Erklaere mir kurz, was du als Master-Agent kannst.',
      'Soll ich den Agenten live schalten oder erst verbessern?',
      'Hier sind interne Projektdaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestone: 'Phase 123.1: Secure Master Navigation Status',
  };
}
`);

write('frontend/app/api/cmt/master/home/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterHome } from '../../../../lib/cmt-master-home';

export async function GET() {
  return NextResponse.json(getSecureMasterHome());
}
`);

write('frontend/app/cmt/master/home/page.tsx', `import Link from 'next/link';
import { getSecureMasterHome } from '../../../lib/cmt-master-home';

export default function SecureMasterHomePage() {
  const home = getSecureMasterHome();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 123.0</h1>
        <h2>{home.label}</h2>
        <p><strong>Status:</strong> {home.status.mainMessage}</p>
      </section>

      <section style={card}>
        <h3>Wichtigster Einstieg</h3>
        <p><Link href={home.primaryEntry}>Secure Master Agent öffnen</Link></p>
        <p>Diese Seite ist ab jetzt der zentrale lokale Testpunkt.</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>
          <li><Link href={home.statusEntry}>Secure Master Status</Link></li>
          <li><Link href={home.guideEntry}>Secure Master Guide</Link></li>
          <li><Link href={home.relatedEntries.privacy}>Privacy Gate</Link></li>
          <li><Link href={home.relatedEntries.privacyDecision}>Privacy Decision Flow</Link></li>
          <li><Link href={home.relatedEntries.committeeAsk}>Gremium Ask</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testfragen</h3>
        <ol>{home.recommendedTestQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(home.status.localTestable)}</li>
          <li>liveModelEnabled: {String(home.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(home.status.providerEnabled)}</li>
          <li>internetEnabled: {String(home.status.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(home.status.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {home.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE123_0.md', `# Phase 123.0 - Secure Master Home Entry

Macht den Secure Master Agent als zentralen lokalen Haupt-Einstieg sichtbar.

Kurz-Namen:

- Store: frontend/lib/cmt-master-home.ts
- API: /api/cmt/master/home
- UI: /cmt/master/home
- Patch: scripts/p123-0.cjs
- Verify: scripts/v123-0.cjs

Haupt-Testpunkt:

- /cmt/master/secure

Neue Einstiegsseite:

- /cmt/master/home

Status:

- lokal testbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v123-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-home.ts', 'getSecureMasterHome'],
  ['frontend/lib/cmt-master-home.ts', "phase: '123.0'"],
  ['frontend/lib/cmt-master-home.ts', "primaryEntry: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-home.ts', 'liveModelEnabled: false'],
  ['frontend/lib/cmt-master-home.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/home/route.ts', 'getSecureMasterHome'],
  ['frontend/app/cmt/master/home/page.tsx', 'Secure Master Agent öffnen'],
  ['frontend/app/cmt/master/home/page.tsx', 'Wichtigster Einstieg'],
  ['README_PHASE123_0.md', 'Secure Master Home Entry'],
  ['package.json', 'phase123:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.0 Secure Master Home Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase123:0:verify'] = 'node scripts/v123-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 123.0 Secure Master Home Entry patch applied.');
