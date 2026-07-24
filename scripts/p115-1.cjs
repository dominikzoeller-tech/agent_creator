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

write('frontend/lib/cmt-land-status.ts', `import { getCommitteeLanding, type CommitteeLanding } from './cmt-land';

export type CommitteeLandingStatus = {
  phase: '115.1';
  label: 'Gremium Landing Status';
  landing: CommitteeLanding;
  status: {
    ready: true;
    pages: string[];
    apiRoutes: string[];
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

export function getCommitteeLandingStatus(): CommitteeLandingStatus {
  const landing = getCommitteeLanding();
  return {
    phase: '115.1',
    label: 'Gremium Landing Status',
    landing,
    status: {
      ready: true,
      pages: landing.links.map((link) => link.href),
      apiRoutes: ['/api/cmt/land', '/api/cmt/demo', '/api/cmt/demo/report', '/api/cmt/demo/share'],
      checks: [
        'Landing Page vorhanden',
        'Demo Page verlinkt',
        'Report Page verlinkt',
        'Share Page verlinkt',
        'Safety State dry-run-only',
      ],
      summary: 'Die MVP-Landing ist bereit und verlinkt Demo, Report, Share und Session Summary.',
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

write('frontend/app/api/cmt/land/status/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLandingStatus } from '../../../../../lib/cmt-land-status';

export async function GET() {
  return NextResponse.json(getCommitteeLandingStatus());
}
`);

write('frontend/app/cmt/land/status/page.tsx', `import Link from 'next/link';
import { getCommitteeLandingStatus } from '../../../../lib/cmt-land-status';

export default function CommitteeLandingStatusPage() {
  const status = getCommitteeLandingStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><strong>ready:</strong> {String(status.status.ready)}</p>
        <p><Link href="/cmt/land">Zur Landing Page</Link></p>
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <article style={card}>
          <h3>Pages</h3>
          <ul>{status.status.pages.map((item) => <li key={item}><Link href={item}>{item}</Link></li>)}</ul>
        </article>

        <article style={card}>
          <h3>API Routes</h3>
          <ul>{status.status.apiRoutes.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>

        <article style={card}>
          <h3>Checks</h3>
          <ul>{status.status.checks.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
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

write('README_PHASE115_1.md', `# Phase 115.1 - Gremium Landing Status

Baut eine Statusseite fuer die MVP-Landing des Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-land-status.ts
- API: /api/cmt/land/status
- UI: /cmt/land/status
- Patch: scripts/p115-1.cjs
- Verify: scripts/v115-1.cjs

Funktion:

- Landing Page Status anzeigen
- verlinkte Pages anzeigen
- API-Routen auffuehren
- Safety Checks anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v115-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-status.ts', "phase: '115.1'"],
  ['frontend/lib/cmt-land-status.ts', "label: 'Gremium Landing Status'"],
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/status/route.ts', 'getCommitteeLandingStatus'],
  ['frontend/app/cmt/land/status/page.tsx', 'Phase 115.1'],
  ['frontend/app/cmt/land/status/page.tsx', 'Zur Landing Page'],
  ['README_PHASE115_1.md', 'Gremium Landing Status'],
  ['package.json', 'phase115:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.1 Gremium Landing Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase115:1:verify'] = 'node scripts/v115-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 115.1 Gremium Landing Status patch applied.');
