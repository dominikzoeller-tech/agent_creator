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

write('frontend/lib/cmt-json-guide.ts', `import { getCommitteeLocalJsonStatus, type CommitteeLocalJsonStatus } from './cmt-json-status';

export type CommitteeLocalJsonGuide = {
  phase: '118.2';
  label: 'Gremium Local JSON Guide';
  status: CommitteeLocalJsonStatus;
  guide: {
    title: string;
    steps: string[];
    plannedFiles: string[];
    blockedNow: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLocalJsonGuide(): CommitteeLocalJsonGuide {
  const status = getCommitteeLocalJsonStatus();
  return {
    phase: '118.2',
    label: 'Gremium Local JSON Guide',
    status,
    guide: {
      title: 'Local JSON Ausbau Guide',
      steps: [
        'Local JSON Plan pruefen.',
        'Local JSON Status pruefen.',
        'Zielordner und Dateiname validieren.',
        'Payload-Schema pruefen.',
        'Echte Datei-Schreibvorgaenge erst nach expliziter Freigabe aktivieren.',
      ],
      plannedFiles: [
        status.plan.localJson.directory + '/' + status.plan.localJson.fileName,
        status.plan.localJson.directory + '/index.json',
        status.plan.localJson.directory + '/README.md',
      ],
      blockedNow: ['actualFileWriteEnabled', 'externalStorageEnabled', 'networkCallAllowed', 'providerDispatchAllowed'],
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

write('frontend/app/api/cmt/json/guide/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonGuide } from '../../../../../lib/cmt-json-guide';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonGuide());
}
`);

write('frontend/app/cmt/json/guide/page.tsx', `import Link from 'next/link';
import { getCommitteeLocalJsonGuide } from '../../../../lib/cmt-json-guide';

export default function CommitteeLocalJsonGuidePage() {
  const guide = getCommitteeLocalJsonGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.2</h1>
        <h2>{guide.label}</h2>
        <p>{guide.guide.title}</p>
        <p><Link href="/cmt/json/status">Zum Local JSON Status</Link></p>
      </section>

      <section style={card}>
        <h3>Schritte</h3>
        <ol>{guide.guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Geplante Dateien</h3>
        <ul>{guide.guide.plannedFiles.map((file) => <li key={file}>{file}</li>)}</ul>
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

write('README_PHASE118_2.md', `# Phase 118.2 - Gremium Local JSON Guide

Baut einen Guide fuer den Local JSON Persistenz-Plan.

Kurz-Namen:

- Store: frontend/lib/cmt-json-guide.ts
- API: /api/cmt/json/guide
- UI: /cmt/json/guide
- Patch: scripts/p118-2.cjs
- Verify: scripts/v118-2.cjs

Funktion:

- Local JSON Status wiederverwenden
- Ausbau-Schritte anzeigen
- geplante Dateien anzeigen
- blockierte Felder fuer Safety anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
`);

write('scripts/v118-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonGuide'],
  ['frontend/lib/cmt-json-guide.ts', "phase: '118.2'"],
  ['frontend/lib/cmt-json-guide.ts', "label: 'Gremium Local JSON Guide'"],
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-guide.ts', 'plannedFiles'],
  ['frontend/lib/cmt-json-guide.ts', 'actualFileWriteEnabled'],
  ['frontend/lib/cmt-json-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/guide/route.ts', 'getCommitteeLocalJsonGuide'],
  ['frontend/app/cmt/json/guide/page.tsx', 'Phase 118.2'],
  ['frontend/app/cmt/json/guide/page.tsx', 'Geplante Dateien'],
  ['README_PHASE118_2.md', 'Gremium Local JSON Guide'],
  ['package.json', 'phase118:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.2 Gremium Local JSON Guide verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase118:2:verify'] = 'node scripts/v118-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 118.2 Gremium Local JSON Guide patch applied.');
