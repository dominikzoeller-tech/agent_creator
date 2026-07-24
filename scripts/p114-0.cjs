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

write('frontend/lib/cmt-demo.ts', `import { createCommitteeSessionSummary, type CommitteeSessionSummary } from './cmt-sum';

export type CommitteeMvpDemo = {
  phase: '114.0';
  label: 'Gremium MVP Demo';
  demoId: string;
  userQuestion: string;
  flow: {
    step: string;
    result: string;
  }[];
  summary: CommitteeSessionSummary;
  finalAnswer: {
    headline: string;
    recommendation: string;
    risks: string[];
    actions: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeMvpDemo(question: string): CommitteeMvpDemo {
  const safeQuestion = question.trim() || 'Soll der Agent diese Entscheidung mit dem Gremium bewerten?';
  const summary = createCommitteeSessionSummary([
    safeQuestion,
    'Welche Risiken sieht das Gremium?',
    'Welche naechsten Aktionen empfiehlt das Gremium?',
  ]);

  return {
    phase: '114.0',
    label: 'Gremium MVP Demo',
    demoId: 'demo-114-0',
    userQuestion: safeQuestion,
    flow: [
      { step: '1 intake', result: 'User-Frage wurde dry-run-only angenommen.' },
      { step: '2 routing', result: 'Passende Gremiumsrollen wurden intern ausgewaehlt.' },
      { step: '3 deliberation', result: 'Rollenmeinungen wurden simuliert erzeugt.' },
      { step: '4 result', result: 'Entscheidung, Risiken und Aktionen wurden aggregiert.' },
      { step: '5 summary', result: 'Session-Zusammenfassung wurde erstellt.' },
    ],
    summary,
    finalAnswer: {
      headline: 'MVP-Demo erfolgreich erzeugt.',
      recommendation: summary.summary.decisions[0] ?? 'proceed-dry-run',
      risks: summary.summary.topRisks,
      actions: summary.summary.nextActions,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeMvpDemo() {
  return createCommitteeMvpDemo('Soll der Gremium-Agent als MVP-Demo eine Frage komplett durch den internen Flow fuehren?');
}
`);

write('frontend/app/api/cmt/demo/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeMvpDemo, getCommitteeMvpDemo } from '../../../../lib/cmt-demo';

export async function GET() {
  return NextResponse.json(getCommitteeMvpDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeMvpDemo(text));
}
`);

write('frontend/app/cmt/demo/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeMvpDemo } from '../../../lib/cmt-demo';

export default function CommitteeMvpDemoPage() {
  const [text, setText] = useState('Soll der Gremium-Agent als MVP-Demo eine Frage komplett durch den internen Flow fuehren?');
  const [demo, setDemo] = useState<CommitteeMvpDemo | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDemo() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setDemo(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 114.0</h1>
      <h2>Gremium MVP Demo</h2>
      <p>Ein kompletter dry-run-only Demo-Flow vom User-Input bis zur Gremiumsantwort.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={runDemo} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Demo laeuft...' : 'MVP-Demo starten'}
        </button>
      </section>

      {demo && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{demo.finalAnswer.headline}</h3>
            <p><strong>recommendation:</strong> {demo.finalAnswer.recommendation}</p>
          </article>

          <article style={card}>
            <h3>Flow</h3>
            <ol>{demo.flow.map((item) => <li key={item.step}><strong>{item.step}:</strong> {item.result}</li>)}</ol>
          </article>

          <article style={card}>
            <h3>Risiken</h3>
            <ul>{demo.finalAnswer.risks.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Aktionen</h3>
            <ul>{demo.finalAnswer.actions.map((item) => <li key={item}>{item}</li>)}</ul>
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

write('README_PHASE114_0.md', `# Phase 114.0 - Gremium MVP Demo

Baut den ersten kompletten MVP-Demo-Flow fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-demo.ts
- API: /api/cmt/demo
- UI: /cmt/demo
- Patch: scripts/p114-0.cjs
- Verify: scripts/v114-0.cjs

Funktion:

- User-Frage annehmen
- bestehende Summary nutzen
- Demo-Flow darstellen
- finale Empfehlung, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v114-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo.ts', 'getCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo.ts', "phase: '114.0'"],
  ['frontend/lib/cmt-demo.ts', "label: 'Gremium MVP Demo'"],
  ['frontend/lib/cmt-demo.ts', 'createCommitteeSessionSummary'],
  ['frontend/lib/cmt-demo.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/route.ts', 'createCommitteeMvpDemo'],
  ['frontend/app/cmt/demo/page.tsx', 'MVP-Demo starten'],
  ['frontend/app/cmt/demo/page.tsx', "fetch('/api/cmt/demo'"],
  ['README_PHASE114_0.md', 'Gremium MVP Demo'],
  ['package.json', 'phase114:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.0 Gremium MVP Demo verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase114:0:verify'] = 'node scripts/v114-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 114.0 Gremium MVP Demo patch applied.');
