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

write('frontend/lib/cmt-land.ts', `import { getCommitteeMvpDemo, type CommitteeMvpDemo } from './cmt-demo';
import { getCommitteeDemoReport, type CommitteeDemoReport } from './cmt-demo-report';
import { getCommitteeDemoShare, type CommitteeDemoShare } from './cmt-demo-share';

export type CommitteeLanding = {
  phase: '115.0';
  label: 'Gremium MVP Landing';
  hero: {
    title: string;
    subtitle: string;
    primaryPath: string;
    secondaryPath: string;
  };
  links: {
    title: string;
    href: string;
    description: string;
  }[];
  demo: CommitteeMvpDemo;
  report: CommitteeDemoReport;
  share: CommitteeDemoShare;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLanding(): CommitteeLanding {
  return {
    phase: '115.0',
    label: 'Gremium MVP Landing',
    hero: {
      title: 'Gremium-Agent MVP',
      subtitle: 'Eine dry-run-only Landing Page fuer Demo, Report und Share des Gremium-Agenten.',
      primaryPath: '/cmt/demo',
      secondaryPath: '/cmt/demo/share',
    },
    links: [
      { title: 'Demo starten', href: '/cmt/demo', description: 'Fuehrt eine Nutzerfrage durch den MVP-Demo-Flow.' },
      { title: 'Report ansehen', href: '/cmt/demo/report', description: 'Zeigt den kompakten Demo-Report.' },
      { title: 'Share erzeugen', href: '/cmt/demo/share', description: 'Erstellt eine copy-ready Kurzfassung.' },
      { title: 'Session Summary', href: '/cmt/sum', description: 'Zeigt die Zusammenfassung gespeicherter Gremiumsfragen.' },
    ],
    demo: getCommitteeMvpDemo(),
    report: getCommitteeDemoReport(),
    share: getCommitteeDemoShare(),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/land/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeLanding } from '../../../../lib/cmt-land';

export async function GET() {
  return NextResponse.json(getCommitteeLanding());
}
`);

write('frontend/app/cmt/land/page.tsx', `import Link from 'next/link';
import { getCommitteeLanding } from '../../../lib/cmt-land';

export default function CommitteeLandingPage() {
  const landing = getCommitteeLanding();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.0</h1>
        <h2>{landing.hero.title}</h2>
        <p>{landing.hero.subtitle}</p>
        <p>
          <Link href={landing.hero.primaryPath}>Demo starten</Link>
          {' | '}
          <Link href={landing.hero.secondaryPath}>Share erzeugen</Link>
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <h3>Navigation</h3>
        {landing.links.map((link) => (
          <article key={link.href} style={card}>
            <h4><Link href={link.href}>{link.title}</Link></h4>
            <p>{link.description}</p>
          </article>
        ))}
      </section>

      <section style={card}>
        <h3>Demo Snapshot</h3>
        <p><strong>Demo:</strong> {landing.demo.finalAnswer.headline}</p>
        <p><strong>Report:</strong> {landing.report.report.title}</p>
        <p><strong>Share:</strong> {landing.share.share.title}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {landing.provider}</li>
          <li>modelSelected: {landing.modelSelected}</li>
          <li>dryRunOnly: {String(landing.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(landing.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(landing.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(landing.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE115_0.md', `# Phase 115.0 - Gremium MVP Landing

Baut die Landing Page fuer den MVP-Demo-Flow des Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-land.ts
- API: /api/cmt/land
- UI: /cmt/land
- Patch: scripts/p115-0.cjs
- Verify: scripts/v115-0.cjs

Funktion:

- zentrale Landing Page fuer Demo, Report und Share
- Links auf MVP-Demo-Seiten
- Snapshot der Demo-Ergebnisse anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v115-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land.ts', "phase: '115.0'"],
  ['frontend/lib/cmt-land.ts', "label: 'Gremium MVP Landing'"],
  ['frontend/lib/cmt-land.ts', 'getCommitteeMvpDemo'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeDemoReport'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeDemoShare'],
  ['frontend/lib/cmt-land.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/route.ts', 'getCommitteeLanding'],
  ['frontend/app/cmt/land/page.tsx', 'Phase 115.0'],
  ['frontend/app/cmt/land/page.tsx', 'Demo starten'],
  ['README_PHASE115_0.md', 'Gremium MVP Landing'],
  ['package.json', 'phase115:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.0 Gremium MVP Landing verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase115:0:verify'] = 'node scripts/v115-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 115.0 Gremium MVP Landing patch applied.');
