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

write('frontend/lib/cmt-master-app-entry.ts', `import { getSecureMasterNavStatus, type SecureMasterNavStatus } from './cmt-master-nav-status';

export type SecureMasterAppEntry = {
  phase: '123.2';
  label: 'Secure Master App Entry';
  nav: SecureMasterNavStatus;
  appEntry: {
    title: 'Secure Master Agent';
    subtitle: string;
    primaryHref: '/cmt/master/secure';
    secondaryHref: '/cmt/master/home';
    statusHref: '/cmt/master/nav/status';
    guideHref: '/cmt/master/secure/guide';
    recommendedBookmark: 'http://localhost:3001/cmt/master/secure';
  };
  visibleLinks: string[];
  status: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAppEntry(): SecureMasterAppEntry {
  return {
    phase: '123.2',
    label: 'Secure Master App Entry',
    nav: getSecureMasterNavStatus(),
    appEntry: {
      title: 'Secure Master Agent',
      subtitle: 'Zentraler lokaler Einstieg fuer Master-Agent, Privacy-Gate und Gremium-Routing.',
      primaryHref: '/cmt/master/secure',
      secondaryHref: '/cmt/master/home',
      statusHref: '/cmt/master/nav/status',
      guideHref: '/cmt/master/secure/guide',
      recommendedBookmark: 'http://localhost:3001/cmt/master/secure',
    },
    visibleLinks: [
      '/cmt/master/secure',
      '/cmt/master/home',
      '/cmt/master/nav/status',
      '/cmt/master/secure/guide',
      '/cmt/privacy',
      '/cmt/ask',
    ],
    status: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 123.3: Secure Master Entry Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/app-entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAppEntry } from '../../../../lib/cmt-master-app-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAppEntry());
}
`);

write('frontend/app/cmt/master/app-entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAppEntry } from '../../../lib/cmt-master-app-entry';

export default function SecureMasterAppEntryPage() {
  const entry = getSecureMasterAppEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 123.2</h1>
        <h2>{entry.appEntry.title}</h2>
        <p>{entry.appEntry.subtitle}</p>
        <p><strong>Status:</strong> lokal testbar, noch nicht live mit KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Start</h3>
        <p><Link href={entry.appEntry.primaryHref}>Secure Master Agent starten</Link></p>
        <p><strong>Bookmark:</strong> {entry.appEntry.recommendedBookmark}</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Weitere Einstiege</h3>
        <ul>
          <li><Link href={entry.appEntry.secondaryHref}>Home Entry</Link></li>
          <li><Link href={entry.appEntry.statusHref}>Navigation Status</Link></li>
          <li><Link href={entry.appEntry.guideHref}>Guide</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Links</h3>
        <ul>{entry.visibleLinks.map((href) => <li key={href}><Link href={href}>{href}</Link></li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.status.localTestable)}</li>
          <li>liveModelEnabled: {String(entry.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.status.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.status.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.status.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE123_2.md', `# Phase 123.2 - Secure Master App Entry

Baut eine klare App-Entry-Seite fuer den Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-app-entry.ts
- API: /api/cmt/master/app-entry
- UI: /cmt/master/app-entry
- Patch: scripts/p123-2.cjs
- Verify: scripts/v123-2.cjs

Wichtigster lokaler Einstieg:

- /cmt/master/secure

Empfohlenes Bookmark:

- http://localhost:3001/cmt/master/secure

Status:

- lokal testbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v123-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-app-entry.ts', 'getSecureMasterAppEntry'],
  ['frontend/lib/cmt-master-app-entry.ts', "phase: '123.2'"],
  ['frontend/lib/cmt-master-app-entry.ts', "primaryHref: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-app-entry.ts', "recommendedBookmark: 'http://localhost:3001/cmt/master/secure'"],
  ['frontend/lib/cmt-master-app-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/app-entry/route.ts', 'getSecureMasterAppEntry'],
  ['frontend/app/cmt/master/app-entry/page.tsx', 'Secure Master Agent starten'],
  ['frontend/app/cmt/master/app-entry/page.tsx', 'Bookmark'],
  ['README_PHASE123_2.md', 'Secure Master App Entry'],
  ['package.json', 'phase123:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.2 Secure Master App Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase123:2:verify'] = 'node scripts/v123-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 123.2 Secure Master App Entry patch applied.');
