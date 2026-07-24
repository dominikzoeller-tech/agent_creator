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

write('frontend/lib/cmt-json.ts', `import { getCommitteePersistGuide, type CommitteePersistGuide } from './cmt-persist-guide';
import { getCommitteePersistAdapterDemo, type CommitteePersistAdapter } from './cmt-persist';

export type CommitteeLocalJsonPlan = {
  phase: '118.0';
  label: 'Gremium Local JSON Plan';
  guide: CommitteePersistGuide;
  persist: CommitteePersistAdapter;
  localJson: {
    target: 'local-json';
    fileName: string;
    directory: string;
    writeMode: 'planned-only';
    schemaVersion: '1';
    externalStorageEnabled: false;
    actualFileWriteEnabled: false;
    plannedPayload: {
      sessionKey: string;
      savedCount: number;
      questions: string[];
    };
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLocalJsonPlan(): CommitteeLocalJsonPlan {
  const guide = getCommitteePersistGuide();
  const persist = getCommitteePersistAdapterDemo();
  return {
    phase: '118.0',
    label: 'Gremium Local JSON Plan',
    guide,
    persist,
    localJson: {
      target: 'local-json',
      fileName: persist.persisted.key + '.json',
      directory: '.data/cmt-sessions',
      writeMode: 'planned-only',
      schemaVersion: '1',
      externalStorageEnabled: false,
      actualFileWriteEnabled: false,
      plannedPayload: {
        sessionKey: persist.persisted.key,
        savedCount: persist.persisted.itemCount,
        questions: persist.session.history.items.map((item) => item.question),
      },
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

write('frontend/app/api/cmt/json/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonPlan } from '../../../../lib/cmt-json';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonPlan());
}
`);

write('frontend/app/cmt/json/page.tsx', `import Link from 'next/link';
import { getCommitteeLocalJsonPlan } from '../../../lib/cmt-json';

export default function CommitteeLocalJsonPage() {
  const plan = getCommitteeLocalJsonPlan();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.0</h1>
        <h2>{plan.label}</h2>
        <p>Local JSON Persistenz ist geplant, aber echte Datei-Schreibvorgaenge bleiben deaktiviert.</p>
        <p><Link href="/cmt/persist/guide">Zum Persist Guide</Link></p>
      </section>

      <section style={card}>
        <h3>Local JSON Plan</h3>
        <ul>
          <li>target: {plan.localJson.target}</li>
          <li>directory: {plan.localJson.directory}</li>
          <li>fileName: {plan.localJson.fileName}</li>
          <li>writeMode: {plan.localJson.writeMode}</li>
          <li>schemaVersion: {plan.localJson.schemaVersion}</li>
          <li>externalStorageEnabled: {String(plan.localJson.externalStorageEnabled)}</li>
          <li>actualFileWriteEnabled: {String(plan.localJson.actualFileWriteEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Planned Payload</h3>
        <ul>
          <li>sessionKey: {plan.localJson.plannedPayload.sessionKey}</li>
          <li>savedCount: {plan.localJson.plannedPayload.savedCount}</li>
        </ul>
        <ol>{plan.localJson.plannedPayload.questions.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {plan.provider}</li>
          <li>modelSelected: {plan.modelSelected}</li>
          <li>dryRunOnly: {String(plan.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(plan.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(plan.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(plan.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE118_0.md', `# Phase 118.0 - Gremium Local JSON Plan

Bereitet Local JSON Persistenz fuer Gremiums-Sessions vor, weiterhin dry-run-only.

Kurz-Namen:

- Store: frontend/lib/cmt-json.ts
- API: /api/cmt/json
- UI: /cmt/json
- Patch: scripts/p118-0.cjs
- Verify: scripts/v118-0.cjs

Funktion:

- Persist Guide und Persist Adapter wiederverwenden
- Local JSON Ziel planen
- Dateiname, Zielordner und Payload anzeigen
- echte Datei-Schreibvorgaenge deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v118-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json.ts', "phase: '118.0'"],
  ['frontend/lib/cmt-json.ts', "label: 'Gremium Local JSON Plan'"],
  ['frontend/lib/cmt-json.ts', 'getCommitteePersistGuide'],
  ['frontend/lib/cmt-json.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-json.ts', "target: 'local-json'"],
  ['frontend/lib/cmt-json.ts', "writeMode: 'planned-only'"],
  ['frontend/lib/cmt-json.ts', 'actualFileWriteEnabled: false'],
  ['frontend/lib/cmt-json.ts', 'externalStorageEnabled: false'],
  ['frontend/lib/cmt-json.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/route.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/app/cmt/json/page.tsx', 'Phase 118.0'],
  ['frontend/app/cmt/json/page.tsx', 'Local JSON Plan'],
  ['README_PHASE118_0.md', 'Gremium Local JSON Plan'],
  ['package.json', 'phase118:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.0 Gremium Local JSON Plan verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase118:0:verify'] = 'node scripts/v118-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 118.0 Gremium Local JSON Plan patch applied.');
