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

write('frontend/lib/cmt-nav.ts', `import { getCommitteeLanding, type CommitteeLanding } from './cmt-land';

export type CommitteeMainNav = {
  phase: '116.0';
  label: 'Gremium Main Navigation';
  landing: CommitteeLanding;
  nav: {
    title: string;
    items: {
      label: string;
      href: string;
      kind: 'primary' | 'secondary';
    }[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeMainNav(): CommitteeMainNav {
  const landing = getCommitteeLanding();
  return {
    phase: '116.0',
    label: 'Gremium Main Navigation',
    landing,
    nav: {
      title: 'Gremium-Agent',
      items: [
        { label: 'MVP Landing', href: '/cmt/land', kind: 'primary' },
        { label: 'Demo', href: '/cmt/demo', kind: 'primary' },
        { label: 'Report', href: '/cmt/demo/report', kind: 'secondary' },
        { label: 'Share', href: '/cmt/demo/share', kind: 'secondary' },
        { label: 'Guide', href: '/cmt/land/guide', kind: 'secondary' },
        { label: 'Status', href: '/cmt/land/status', kind: 'secondary' },
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

write('frontend/app/api/cmt/nav/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeMainNav } from '../../../../lib/cmt-nav';

export async function GET() {
  return NextResponse.json(getCommitteeMainNav());
}
`);

write('frontend/app/cmt/nav/page.tsx', `import Link from 'next/link';
import { getCommitteeMainNav } from '../../../lib/cmt-nav';

export default function CommitteeMainNavPage() {
  const mainNav = getCommitteeMainNav();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.0</h1>
        <h2>{mainNav.label}</h2>
        <p>Die MVP-Navigation buendelt Landing, Demo, Report, Share, Guide und Status.</p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h3>{mainNav.nav.title}</h3>
        {mainNav.nav.items.map((item) => (
          <article key={item.href} style={card}>
            <h4><Link href={item.href}>{item.label}</Link></h4>
            <p>kind: {item.kind}</p>
          </article>
        ))}
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {mainNav.provider}</li>
          <li>modelSelected: {mainNav.modelSelected}</li>
          <li>dryRunOnly: {String(mainNav.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(mainNav.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(mainNav.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(mainNav.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE116_0.md', `# Phase 116.0 - Gremium Main Navigation

Integriert die MVP-Navigation fuer den Gremium-Agenten als eigene Navigationsseite.

Kurz-Namen:

- Store: frontend/lib/cmt-nav.ts
- API: /api/cmt/nav
- UI: /cmt/nav
- Patch: scripts/p116-0.cjs
- Verify: scripts/v116-0.cjs

Funktion:

- zentrale Navigation fuer Landing, Demo, Report, Share, Guide und Status
- Landing-Daten wiederverwenden
- MVP-Einstieg fuer die Haupt-App vorbereiten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v116-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-nav.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-nav.ts', "phase: '116.0'"],
  ['frontend/lib/cmt-nav.ts', "label: 'Gremium Main Navigation'"],
  ['frontend/lib/cmt-nav.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-nav.ts', "provider: 'none'"],
  ['frontend/lib/cmt-nav.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-nav.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/nav/route.ts', 'getCommitteeMainNav'],
  ['frontend/app/cmt/nav/page.tsx', 'Phase 116.0'],
  ['frontend/app/cmt/nav/page.tsx', 'MVP-Navigation'],
  ['README_PHASE116_0.md', 'Gremium Main Navigation'],
  ['package.json', 'phase116:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.0 Gremium Main Navigation verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase116:0:verify'] = 'node scripts/v116-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 116.0 Gremium Main Navigation patch applied.');
