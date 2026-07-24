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

write('frontend/lib/cmt-json-status.ts', `import { getCommitteeLocalJsonPlan, type CommitteeLocalJsonPlan } from './cmt-json';

export type CommitteeLocalJsonStatus = {
  phase: '118.1';
  label: 'Gremium Local JSON Status';
  plan: CommitteeLocalJsonPlan;
  status: {
    ready: true;
    target: 'local-json';
    writeMode: 'planned-only';
    actualFileWriteEnabled: false;
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

export function getCommitteeLocalJsonStatus(): CommitteeLocalJsonStatus {
  const plan = getCommitteeLocalJsonPlan();
  return {
    phase: '118.1',
    label: 'Gremium Local JSON Status',
    plan,
    status: {
      ready: true,
      target: 'local-json',
      writeMode: 'planned-only',
      actualFileWriteEnabled: false,
      checks: [
        'Local JSON Plan vorhanden',
        'Zielordner geplant',
        'Dateiname geplant',
        'Payload geplant',
        'Echte Datei-Schreibvorgaenge deaktiviert',
        'Safety State dry-run-only',
      ],
      summary: 'Local JSON Persistenz ist geplant und validiert, schreibt aber noch keine Dateien.',
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

write('frontend/app/api/cmt/json/status/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonStatus } from '../../../../../lib/cmt-json-status';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonStatus());
}
`);

write('frontend/app/cmt/json/status/page.tsx', `import Link from 'next/link';
import { getCommitteeLocalJsonStatus } from '../../../../lib/cmt-json-status';

export default function CommitteeLocalJsonStatusPage() {
  const status = getCommitteeLocalJsonStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href="/cmt/json">Zum Local JSON Plan</Link></p>
      </section>

      <section style={card}>
        <h3>Status</h3>
        <ul>
          <li>ready: {String(status.status.ready)}</li>
          <li>target: {status.status.target}</li>
          <li>writeMode: {status.status.writeMode}</li>
          <li>actualFileWriteEnabled: {String(status.status.actualFileWriteEnabled)}</li>
          <li>directory: {status.plan.localJson.directory}</li>
          <li>fileName: {status.plan.localJson.fileName}</li>
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

write('README_PHASE118_1.md', `# Phase 118.1 - Gremium Local JSON Status

Baut eine Statusseite fuer den Local JSON Persistenz-Plan.

Kurz-Namen:

- Store: frontend/lib/cmt-json-status.ts
- API: /api/cmt/json/status
- UI: /cmt/json/status
- Patch: scripts/p118-1.cjs
- Verify: scripts/v118-1.cjs

Funktion:

- Local JSON Plan wiederverwenden
- Status und Checks anzeigen
- Zielordner und Dateiname anzeigen
- echte Datei-Schreibvorgaenge deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v118-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-status.ts', "phase: '118.1'"],
  ['frontend/lib/cmt-json-status.ts', "label: 'Gremium Local JSON Status'"],
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json-status.ts', "target: 'local-json'"],
  ['frontend/lib/cmt-json-status.ts', "writeMode: 'planned-only'"],
  ['frontend/lib/cmt-json-status.ts', 'actualFileWriteEnabled: false'],
  ['frontend/lib/cmt-json-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/status/route.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/app/cmt/json/status/page.tsx', 'Phase 118.1'],
  ['frontend/app/cmt/json/status/page.tsx', 'Zum Local JSON Plan'],
  ['README_PHASE118_1.md', 'Gremium Local JSON Status'],
  ['package.json', 'phase118:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.1 Gremium Local JSON Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase118:1:verify'] = 'node scripts/v118-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 118.1 Gremium Local JSON Status patch applied.');
