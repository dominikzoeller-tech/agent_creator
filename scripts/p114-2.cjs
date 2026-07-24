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

write('frontend/lib/cmt-demo-share.ts', `import { createCommitteeDemoReport, type CommitteeDemoReport } from './cmt-demo-report';

export type CommitteeDemoShare = {
  phase: '114.2';
  label: 'Gremium Demo Share';
  report: CommitteeDemoReport;
  share: {
    title: string;
    plainText: string;
    bullets: string[];
    copyReady: true;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDemoShare(question: string): CommitteeDemoShare {
  const report = createCommitteeDemoReport(question);
  const bullets = [
    'Frage: ' + report.report.question,
    'Verdict: ' + report.report.verdict,
    'Risiken: ' + report.report.riskLines.join(' | '),
    'Aktionen: ' + report.report.actionLines.join(' | '),
    'Safety: dry-run-only, provider none, keine Netzwerk-Calls.',
  ];

  return {
    phase: '114.2',
    label: 'Gremium Demo Share',
    report,
    share: {
      title: 'Gremium-Agent MVP Demo Share',
      plainText: bullets.join('\n'),
      bullets,
      copyReady: true,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDemoShare() {
  return createCommitteeDemoShare('Soll der Gremium-Agent eine copy-ready Demo-Zusammenfassung erzeugen?');
}
`);

write('frontend/app/api/cmt/demo/share/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeDemoShare, getCommitteeDemoShare } from '../../../../../lib/cmt-demo-share';

export async function GET() {
  return NextResponse.json(getCommitteeDemoShare());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDemoShare(text));
}
`);

write('frontend/app/cmt/demo/share/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeDemoShare } from '../../../../lib/cmt-demo-share';

export default function CommitteeDemoSharePage() {
  const [text, setText] = useState('Soll der Gremium-Agent eine copy-ready Demo-Zusammenfassung erzeugen?');
  const [share, setShare] = useState<CommitteeDemoShare | null>(null);
  const [loading, setLoading] = useState(false);

  async function runShare() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/demo/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setShare(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 114.2</h1>
      <h2>Gremium Demo Share</h2>
      <p>Der Demo-Report wird als copy-ready Kurzfassung bereitgestellt.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={runShare} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Share wird gebaut...' : 'Demo-Share erzeugen'}
        </button>
      </section>

      {share && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{share.share.title}</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{share.share.plainText}</pre>
          </article>

          <article style={card}>
            <h3>Bullets</h3>
            <ul>{share.share.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>
      )}

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>dryRunOnly: true</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE114_2.md', `# Phase 114.2 - Gremium Demo Share

Baut eine copy-ready Kurzfassung fuer den MVP-Demo-Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-demo-share.ts
- API: /api/cmt/demo/share
- UI: /cmt/demo/share
- Patch: scripts/p114-2.cjs
- Verify: scripts/v114-2.cjs

Funktion:

- Demo-Report nutzen
- Plaintext-Share erzeugen
- Bullets fuer Copy/Paste anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v114-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoShare'],
  ['frontend/lib/cmt-demo-share.ts', 'getCommitteeDemoShare'],
  ['frontend/lib/cmt-demo-share.ts', "phase: '114.2'"],
  ['frontend/lib/cmt-demo-share.ts', "label: 'Gremium Demo Share'"],
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-share.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo-share.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo-share.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/share/route.ts', 'createCommitteeDemoShare'],
  ['frontend/app/cmt/demo/share/page.tsx', 'Demo-Share erzeugen'],
  ['frontend/app/cmt/demo/share/page.tsx', "fetch('/api/cmt/demo/share'"],
  ['README_PHASE114_2.md', 'Gremium Demo Share'],
  ['package.json', 'phase114:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.2 Gremium Demo Share verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase114:2:verify'] = 'node scripts/v114-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 114.2 Gremium Demo Share patch applied.');
