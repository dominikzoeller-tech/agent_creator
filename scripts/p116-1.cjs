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

write('frontend/lib/cmt-home.ts', `import { getCommitteeMainNav, type CommitteeMainNav } from './cmt-nav';

export type CommitteeHomeEntry = {
  phase: '116.1';
  label: 'Gremium Home Entry';
  nav: CommitteeMainNav;
  entry: {
    title: string;
    description: string;
    href: string;
    cta: string;
    highlights: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeHomeEntry(): CommitteeHomeEntry {
  const nav = getCommitteeMainNav();
  return {
    phase: '116.1',
    label: 'Gremium Home Entry',
    nav,
    entry: {
      title: 'Gremium-Agent MVP',
      description: 'Schnelleinstieg zur dry-run-only Gremium-Demo direkt aus der Haupt-App.',
      href: '/cmt/nav',
      cta: 'Gremium-Agent oeffnen',
      highlights: [
        'MVP Landing erreichbar',
        'Demo Flow erreichbar',
        'Report und Share erreichbar',
        'Guide und Status erreichbar',
      ],
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/home/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeHomeEntry } from '../../../../lib/cmt-home';

export async function GET() {
  return NextResponse.json(getCommitteeHomeEntry());
}
`);

write('frontend/app/cmt/home/page.tsx', `import Link from 'next/link';
import { getCommitteeHomeEntry } from '../../../lib/cmt-home';

export default function CommitteeHomeEntryPage() {
  const home = getCommitteeHomeEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.1</h1>
        <h2>{home.entry.title}</h2>
        <p>{home.entry.description}</p>
        <p><Link href={home.entry.href}>{home.entry.cta}</Link></p>
      </section>

      <section style={card}>
        <h3>Highlights</h3>
        <ul>{home.entry.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Navigation Snapshot</h3>
        <ul>{home.nav.nav.items.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {home.provider}</li>
          <li>modelSelected: {home.modelSelected}</li>
          <li>dryRunOnly: {String(home.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(home.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(home.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(home.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE116_1.md', `# Phase 116.1 - Gremium Home Entry

Baut den Home-Einstieg fuer die MVP-Navigation des Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-home.ts
- API: /api/cmt/home
- UI: /cmt/home
- Patch: scripts/p116-1.cjs
- Verify: scripts/v116-1.cjs

Funktion:

- Schnelleinstieg fuer den Gremium-Agenten
- Link auf zentrale Navigation
- Highlights und Navigation Snapshot anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v116-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-home.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-home.ts', "phase: '116.1'"],
  ['frontend/lib/cmt-home.ts', "label: 'Gremium Home Entry'"],
  ['frontend/lib/cmt-home.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-home.ts', "provider: 'none'"],
  ['frontend/lib/cmt-home.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-home.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/home/route.ts', 'getCommitteeHomeEntry'],
  ['frontend/app/cmt/home/page.tsx', 'Phase 116.1'],
  ['frontend/app/cmt/home/page.tsx', 'Navigation Snapshot'],
  ['README_PHASE116_1.md', 'Gremium Home Entry'],
  ['package.json', 'phase116:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.1 Gremium Home Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase116:1:verify'] = 'node scripts/v116-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 116.1 Gremium Home Entry patch applied.');
