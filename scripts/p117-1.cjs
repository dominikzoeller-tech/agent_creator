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

write('frontend/lib/cmt-persist-status.ts', `import { getCommitteePersistAdapterDemo, type CommitteePersistAdapter } from './cmt-persist';

export type CommitteePersistStatus = {
  phase: '117.1';
  label: 'Gremium Persist Status';
  persist: CommitteePersistAdapter;
  status: {
    ready: true;
    adapterKind: 'memory-dry-run';
    storageEnabled: false;
    checks: string[];
    summary: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteePersistStatus(): CommitteePersistStatus {
  const persist = getCommitteePersistAdapterDemo();
  return {
    phase: '117.1',
    label: 'Gremium Persist Status',
    persist,
    status: {
      ready: true,
      adapterKind: 'memory-dry-run',
      storageEnabled: false,
      checks: [
        'Persist Adapter vorhanden',
        'Session-Key vorbereitet',
        'Item-Count vorbereitet',
        'Externe Speicherung deaktiviert',
        'Safety State dry-run-only',
      ],
      summary: 'Der Persistenz-Adapter ist vorbereitet, speichert aber noch nicht extern.',
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

write('frontend/app/api/cmt/persist/status/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteePersistStatus } from '../../../../../lib/cmt-persist-status';

export async function GET() {
  return NextResponse.json(getCommitteePersistStatus());
}
`);

write('frontend/app/cmt/persist/status/page.tsx', `import Link from 'next/link';
import { getCommitteePersistStatus } from '../../../../lib/cmt-persist-status';

export default function CommitteePersistStatusPage() {
  const status = getCommitteePersistStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 117.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href="/cmt/persist">Zum Persist Adapter</Link></p>
      </section>

      <section style={card}>
        <h3>Status</h3>
        <ul>
          <li>ready: {String(status.status.ready)}</li>
          <li>adapterKind: {status.status.adapterKind}</li>
          <li>storageEnabled: {String(status.status.storageEnabled)}</li>
          <li>preparedKey: {status.persist.persisted.key}</li>
          <li>itemCount: {status.persist.persisted.itemCount}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ul>{status.status.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE117_1.md', `# Phase 117.1 - Gremium Persist Status

Baut eine Statusseite fuer den dry-run-only Persistenz-Adapter.

Kurz-Namen:

- Store: frontend/lib/cmt-persist-status.ts
- API: /api/cmt/persist/status
- UI: /cmt/persist/status
- Patch: scripts/p117-1.cjs
- Verify: scripts/v117-1.cjs

Funktion:

- Persist Adapter wiederverwenden
- Status und Checks anzeigen
- preparedKey und itemCount anzeigen
- externe Speicherung weiterhin deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v117-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-status.ts', "phase: '117.1'"],
  ['frontend/lib/cmt-persist-status.ts', "label: 'Gremium Persist Status'"],
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-persist-status.ts', 'storageEnabled: false'],
  ['frontend/lib/cmt-persist-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/status/route.ts', 'getCommitteePersistStatus'],
  ['frontend/app/cmt/persist/status/page.tsx', 'Phase 117.1'],
  ['frontend/app/cmt/persist/status/page.tsx', 'Zum Persist Adapter'],
  ['README_PHASE117_1.md', 'Gremium Persist Status'],
  ['package.json', 'phase117:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.1 Gremium Persist Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase117:1:verify'] = 'node scripts/v117-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 117.1 Gremium Persist Status patch applied.');
