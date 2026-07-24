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

write('frontend/lib/cmt-land-guide.ts', `import { getCommitteeLandingStatus, type CommitteeLandingStatus } from './cmt-land-status';

export type CommitteeLandingGuide = {
  phase: '115.2';
  label: 'Gremium Landing Guide';
  status: CommitteeLandingStatus;
  guide: {
    title: string;
    steps: string[];
    demoPath: string;
    reportPath: string;
    sharePath: string;
    statusPath: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLandingGuide(): CommitteeLandingGuide {
  const status = getCommitteeLandingStatus();
  return {
    phase: '115.2',
    label: 'Gremium Landing Guide',
    status,
    guide: {
      title: 'Gremium MVP Demo Guide',
      steps: [
        'Landing Page oeffnen.',
        'Demo starten und eine Testfrage eingeben.',
        'Report pruefen.',
        'Share-Kurzfassung erzeugen.',
        'Statusseite pruefen.',
      ],
      demoPath: '/cmt/demo',
      reportPath: '/cmt/demo/report',
      sharePath: '/cmt/demo/share',
      statusPath: '/cmt/land/status',
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

write('frontend/app/api/cmt/land/guide/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLandingGuide } from '../../../../../lib/cmt-land-guide';

export async function GET() {
  return NextResponse.json(getCommitteeLandingGuide());
}
`);

write('frontend/app/cmt/land/guide/page.tsx', `import Link from 'next/link';
import { getCommitteeLandingGuide } from '../../../../lib/cmt-land-guide';

export default function CommitteeLandingGuidePage() {
  const guide = getCommitteeLandingGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.2</h1>
        <h2>{guide.label}</h2>
        <p>{guide.guide.title}</p>
        <p><Link href="/cmt/land">Zur Landing Page</Link></p>
      </section>

      <section style={card}>
        <h3>Demo Ablauf</h3>
        <ol>{guide.guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Links</h3>
        <ul>
          <li><Link href={guide.guide.demoPath}>Demo</Link></li>
          <li><Link href={guide.guide.reportPath}>Report</Link></li>
          <li><Link href={guide.guide.sharePath}>Share</Link></li>
          <li><Link href={guide.guide.statusPath}>Status</Link></li>
        </ul>
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

write('README_PHASE115_2.md', `# Phase 115.2 - Gremium Landing Guide

Baut einen kurzen Guide fuer die MVP-Landing des Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-land-guide.ts
- API: /api/cmt/land/guide
- UI: /cmt/land/guide
- Patch: scripts/p115-2.cjs
- Verify: scripts/v115-2.cjs

Funktion:

- Demo-Ablauf anzeigen
- Links zu Landing, Demo, Report, Share und Status anzeigen
- Statusdaten wiederverwenden

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v115-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingGuide'],
  ['frontend/lib/cmt-land-guide.ts', "phase: '115.2'"],
  ['frontend/lib/cmt-land-guide.ts', "label: 'Gremium Landing Guide'"],
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/guide/route.ts', 'getCommitteeLandingGuide'],
  ['frontend/app/cmt/land/guide/page.tsx', 'Phase 115.2'],
  ['frontend/app/cmt/land/guide/page.tsx', 'Demo Ablauf'],
  ['README_PHASE115_2.md', 'Gremium Landing Guide'],
  ['package.json', 'phase115:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.2 Gremium Landing Guide verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase115:2:verify'] = 'node scripts/v115-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 115.2 Gremium Landing Guide patch applied.');
