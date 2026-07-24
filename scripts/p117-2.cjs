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

write('frontend/lib/cmt-persist-guide.ts', `import { getCommitteePersistStatus, type CommitteePersistStatus } from './cmt-persist-status';

export type CommitteePersistGuide = {
  phase: '117.2';
  label: 'Gremium Persist Guide';
  status: CommitteePersistStatus;
  guide: {
    title: string;
    steps: string[];
    nextAdapterTargets: string[];
    blockedNow: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteePersistGuide(): CommitteePersistGuide {
  const status = getCommitteePersistStatus();
  return {
    phase: '117.2',
    label: 'Gremium Persist Guide',
    status,
    guide: {
      title: 'Persistenz-Adapter Guide',
      steps: [
        'Session-Struktur ueber cmt-save pruefen.',
        'Persist Adapter ueber cmt-persist pruefen.',
        'Persist Status ueber cmt-persist-status pruefen.',
        'Externe Speicherung erst nach expliziter Freigabe aktivieren.',
        'Storage-Calls weiter blockiert halten.',
      ],
      nextAdapterTargets: ['local-json', 'sqlite', 'server-db', 'encrypted-store'],
      blockedNow: ['externalStorageEnabled', 'networkCallAllowed', 'providerDispatchAllowed', 'finalDispatchBlocked'],
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

write('frontend/app/api/cmt/persist/guide/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteePersistGuide } from '../../../../../lib/cmt-persist-guide';

export async function GET() {
  return NextResponse.json(getCommitteePersistGuide());
}
`);

write('frontend/app/cmt/persist/guide/page.tsx', `import Link from 'next/link';
import { getCommitteePersistGuide } from '../../../../lib/cmt-persist-guide';

export default function CommitteePersistGuidePage() {
  const guide = getCommitteePersistGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 117.2</h1>
        <h2>{guide.label}</h2>
        <p>{guide.guide.title}</p>
        <p><Link href="/cmt/persist/status">Zum Persist Status</Link></p>
      </section>

      <section style={card}>
        <h3>Schritte</h3>
        <ol>{guide.guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Adapter-Ziele</h3>
        <ul>{guide.guide.nextAdapterTargets.map((target) => <li key={target}>{target}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Jetzt blockiert</h3>
        <ul>{guide.guide.blockedNow.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {guide.provider}</li>
          <li>modelSelected: {guide.modelSelected}</li>
          <li>dryRunOnly: {String(guide.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(guide.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(guide.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(guide.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE117_2.md', `# Phase 117.2 - Gremium Persist Guide

Baut einen Guide fuer den dry-run-only Persistenz-Adapter.

Kurz-Namen:

- Store: frontend/lib/cmt-persist-guide.ts
- API: /api/cmt/persist/guide
- UI: /cmt/persist/guide
- Patch: scripts/p117-2.cjs
- Verify: scripts/v117-2.cjs

Funktion:

- Persist Status wiederverwenden
- Schritte zum Persistenz-Ausbau anzeigen
- naechste Adapter-Ziele vorschlagen
- blockierte Felder fuer Safety anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v117-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistGuide'],
  ['frontend/lib/cmt-persist-guide.ts', "phase: '117.2'"],
  ['frontend/lib/cmt-persist-guide.ts', "label: 'Gremium Persist Guide'"],
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-guide.ts', 'local-json'],
  ['frontend/lib/cmt-persist-guide.ts', 'externalStorageEnabled'],
  ['frontend/lib/cmt-persist-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/guide/route.ts', 'getCommitteePersistGuide'],
  ['frontend/app/cmt/persist/guide/page.tsx', 'Phase 117.2'],
  ['frontend/app/cmt/persist/guide/page.tsx', 'Jetzt blockiert'],
  ['README_PHASE117_2.md', 'Gremium Persist Guide'],
  ['package.json', 'phase117:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.2 Gremium Persist Guide verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase117:2:verify'] = 'node scripts/v117-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 117.2 Gremium Persist Guide patch applied.');
