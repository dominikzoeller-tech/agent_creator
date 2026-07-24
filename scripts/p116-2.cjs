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

write('frontend/lib/cmt-app-entry.ts', `import { getCommitteeHomeEntry, type CommitteeHomeEntry } from './cmt-home';

export type CommitteeAppEntry = {
  phase: '116.2';
  label: 'Gremium App Entry';
  home: CommitteeHomeEntry;
  appEntry: {
    title: string;
    href: string;
    badge: string;
    description: string;
    routes: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeAppEntry(): CommitteeAppEntry {
  const home = getCommitteeHomeEntry();
  return {
    phase: '116.2',
    label: 'Gremium App Entry',
    home,
    appEntry: {
      title: 'Gremium-Agent',
      href: '/cmt/home',
      badge: 'MVP dry-run-only',
      description: 'Haupt-App Einstieg fuer Navigation, Demo, Report, Share, Guide und Status.',
      routes: ['/cmt/home', '/cmt/nav', '/cmt/land', '/cmt/demo', '/cmt/demo/report', '/cmt/demo/share'],
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

write('frontend/app/api/cmt/app-entry/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeAppEntry } from '../../../../lib/cmt-app-entry';

export async function GET() {
  return NextResponse.json(getCommitteeAppEntry());
}
`);

write('frontend/app/cmt/app-entry/page.tsx', `import Link from 'next/link';
import { getCommitteeAppEntry } from '../../../lib/cmt-app-entry';

export default function CommitteeAppEntryPage() {
  const entry = getCommitteeAppEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.2</h1>
        <h2>{entry.appEntry.title}</h2>
        <p><strong>{entry.appEntry.badge}</strong></p>
        <p>{entry.appEntry.description}</p>
        <p><Link href={entry.appEntry.href}>Gremium Home oeffnen</Link></p>
      </section>

      <section style={card}>
        <h3>App Routes</h3>
        <ul>{entry.appEntry.routes.map((route) => <li key={route}><Link href={route}>{route}</Link></li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Home Entry</h3>
        <p>{entry.home.entry.description}</p>
        <p><Link href={entry.home.entry.href}>{entry.home.entry.cta}</Link></p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {entry.provider}</li>
          <li>modelSelected: {entry.modelSelected}</li>
          <li>dryRunOnly: {String(entry.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(entry.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(entry.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(entry.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE116_2.md', `# Phase 116.2 - Gremium App Entry

Baut den App-Einstieg fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-app-entry.ts
- API: /api/cmt/app-entry
- UI: /cmt/app-entry
- Patch: scripts/p116-2.cjs
- Verify: scripts/v116-2.cjs

Funktion:

- App-Einstieg fuer den Gremium-Agenten bereitstellen
- Home Entry wiederverwenden
- zentrale MVP-Routen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v116-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeAppEntry'],
  ['frontend/lib/cmt-app-entry.ts', "phase: '116.2'"],
  ['frontend/lib/cmt-app-entry.ts', "label: 'Gremium App Entry'"],
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-app-entry.ts', "provider: 'none'"],
  ['frontend/lib/cmt-app-entry.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-app-entry.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/app-entry/route.ts', 'getCommitteeAppEntry'],
  ['frontend/app/cmt/app-entry/page.tsx', 'Phase 116.2'],
  ['frontend/app/cmt/app-entry/page.tsx', 'App Routes'],
  ['README_PHASE116_2.md', 'Gremium App Entry'],
  ['package.json', 'phase116:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.2 Gremium App Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase116:2:verify'] = 'node scripts/v116-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 116.2 Gremium App Entry patch applied.');
