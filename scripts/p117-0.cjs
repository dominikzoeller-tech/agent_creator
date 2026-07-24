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

write('frontend/lib/cmt-persist.ts', `import { createCommitteeSavedSession, type CommitteeSavedSession } from './cmt-save';

export type CommitteePersistAdapter = {
  phase: '117.0';
  label: 'Gremium Persist Adapter';
  adapter: {
    kind: 'memory-dry-run';
    canRead: true;
    canWrite: true;
    externalStorageEnabled: false;
    storageTarget: 'none';
  };
  session: CommitteeSavedSession;
  persisted: {
    key: string;
    itemCount: number;
    status: 'prepared';
    note: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteePersistAdapter(questions: string[]): CommitteePersistAdapter {
  const session = createCommitteeSavedSession(questions);
  return {
    phase: '117.0',
    label: 'Gremium Persist Adapter',
    adapter: {
      kind: 'memory-dry-run',
      canRead: true,
      canWrite: true,
      externalStorageEnabled: false,
      storageTarget: 'none',
    },
    session,
    persisted: {
      key: session.sessionKey,
      itemCount: session.savedCount,
      status: 'prepared',
      note: 'Persistenz ist vorbereitet, aber noch nicht an externe Speicherung angebunden.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteePersistAdapterDemo() {
  return createCommitteePersistAdapter([
    'Soll der Gremium-Agent Sessions vorbereiten und speichern?',
    'Welche Daten sollen spaeter persistent werden?',
    'Welche Safety-Grenzen gelten fuer Speicheradapter?',
  ]);
}
`);

write('frontend/app/api/cmt/persist/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteePersistAdapter, getCommitteePersistAdapterDemo } from '../../../../lib/cmt-persist';

export async function GET() {
  return NextResponse.json(getCommitteePersistAdapterDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteePersistAdapter(questions));
}
`);

write('frontend/app/cmt/persist/page.tsx', `import { getCommitteePersistAdapterDemo } from '../../../lib/cmt-persist';

export default function CommitteePersistPage() {
  const persist = getCommitteePersistAdapterDemo();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 117.0</h1>
        <h2>{persist.label}</h2>
        <p>Persistenz-Adapter fuer Gremiums-Sessions ist dry-run-only vorbereitet.</p>
      </section>

      <section style={card}>
        <h3>Adapter</h3>
        <ul>
          <li>kind: {persist.adapter.kind}</li>
          <li>canRead: {String(persist.adapter.canRead)}</li>
          <li>canWrite: {String(persist.adapter.canWrite)}</li>
          <li>externalStorageEnabled: {String(persist.adapter.externalStorageEnabled)}</li>
          <li>storageTarget: {persist.adapter.storageTarget}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Prepared Session</h3>
        <ul>
          <li>key: {persist.persisted.key}</li>
          <li>itemCount: {persist.persisted.itemCount}</li>
          <li>status: {persist.persisted.status}</li>
        </ul>
        <p>{persist.persisted.note}</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Session Items</h3>
        <ul>{persist.session.history.items.map((item) => <li key={item.id}>{item.question}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {persist.provider}</li>
          <li>modelSelected: {persist.modelSelected}</li>
          <li>dryRunOnly: {String(persist.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(persist.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(persist.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(persist.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE117_0.md', `# Phase 117.0 - Gremium Persist Adapter

Bereitet einen dry-run-only Persistenz-Adapter fuer Gremiums-Sessions vor.

Kurz-Namen:

- Store: frontend/lib/cmt-persist.ts
- API: /api/cmt/persist
- UI: /cmt/persist
- Patch: scripts/p117-0.cjs
- Verify: scripts/v117-0.cjs

Funktion:

- Session-Speicherung wiederverwenden
- Adapter-Status ausgeben
- Persistenz-Key und Item-Count vorbereiten
- externe Speicherung noch deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v117-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist.ts', 'createCommitteePersistAdapter'],
  ['frontend/lib/cmt-persist.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-persist.ts', "phase: '117.0'"],
  ['frontend/lib/cmt-persist.ts', "label: 'Gremium Persist Adapter'"],
  ['frontend/lib/cmt-persist.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-persist.ts', 'externalStorageEnabled: false'],
  ['frontend/lib/cmt-persist.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/route.ts', 'createCommitteePersistAdapter'],
  ['frontend/app/cmt/persist/page.tsx', 'Phase 117.0'],
  ['frontend/app/cmt/persist/page.tsx', 'Persistenz-Adapter'],
  ['README_PHASE117_0.md', 'Gremium Persist Adapter'],
  ['package.json', 'phase117:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.0 Gremium Persist Adapter verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase117:0:verify'] = 'node scripts/v117-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 117.0 Gremium Persist Adapter patch applied.');
