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

write('frontend/lib/cmt-view.ts', `import { createCommitteeRun, type CommitteeRun } from './cmt-run';

export type CommitteeView = {
  phase: '112.2';
  label: 'Gremium View';
  run: CommitteeRun;
  panels: {
    answer: string;
    decision: string;
    reasons: string[];
    risks: string[];
    actions: string[];
    roles: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeView(input: string): CommitteeView {
  const run = createCommitteeRun(input);
  const brief = run.ask.result.brief;
  const deliberation = run.ask.result.result.session.deliberation;

  return {
    phase: '112.2',
    label: 'Gremium View',
    run,
    panels: {
      answer: brief.userMessage,
      decision: brief.decision,
      reasons: brief.why,
      risks: brief.risks,
      actions: brief.actions,
      roles: deliberation.opinions.map((opinion) => opinion.title + ': ' + opinion.stance),
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeViewDemo() {
  return createCommitteeView('Soll die UI das Gremium-Ergebnis in klaren Panels anzeigen?');
}
`);

write('frontend/app/api/cmt/view/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeView, getCommitteeViewDemo } from '../../../../lib/cmt-view';

export async function GET() {
  return NextResponse.json(getCommitteeViewDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeView(text));
}
`);

write('frontend/app/cmt/view/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeView } from '../../../lib/cmt-view';

export default function CommitteeViewPage() {
  const [text, setText] = useState('Soll die UI das Gremium-Ergebnis in klaren Panels anzeigen?');
  const [view, setView] = useState<CommitteeView | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setView(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.2</h1>
      <h2>Gremium View</h2>
      <p>Das Gremium-Ergebnis wird in klaren Panels angezeigt: Antwort, Entscheidung, Rollen, Risiken und Aktionen.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Panel wird gebaut...' : 'Gremium View erzeugen'}
        </button>
      </section>

      {view && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Antwort</h3>
            <p>{view.panels.answer}</p>
            <p><strong>decision:</strong> {view.panels.decision}</p>
          </article>

          <article style={card}>
            <h3>Rollen</h3>
            <ul>{view.panels.roles.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Risiken</h3>
            <ul>{view.panels.risks.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Aktionen</h3>
            <ul>{view.panels.actions.map((item) => <li key={item}>{item}</li>)}</ul>
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

write('README_PHASE112_2.md', `# Phase 112.2 - Gremium View

Baut die Ergebnis-Panels fuer die Gremium-UI.

Kurz-Namen:

- Store: frontend/lib/cmt-view.ts
- API: /api/cmt/view
- UI: /cmt/view
- Patch: scripts/p112-2.cjs
- Verify: scripts/v112-2.cjs

Funktion:

- Frage eingeben
- Ergebnis per lokaler API erzeugen
- Antwort, Entscheidung, Rollen, Risiken und Aktionen als Panels anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v112-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-view.ts', 'createCommitteeView'],
  ['frontend/lib/cmt-view.ts', 'getCommitteeViewDemo'],
  ['frontend/lib/cmt-view.ts', "phase: '112.2'"],
  ['frontend/lib/cmt-view.ts', "label: 'Gremium View'"],
  ['frontend/lib/cmt-view.ts', 'roles'],
  ['frontend/lib/cmt-view.ts', "provider: 'none'"],
  ['frontend/lib/cmt-view.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-view.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/view/route.ts', 'createCommitteeView'],
  ['frontend/app/cmt/view/page.tsx', 'Gremium View erzeugen'],
  ['frontend/app/cmt/view/page.tsx', "fetch('/api/cmt/view'"],
  ['README_PHASE112_2.md', 'Gremium View'],
  ['package.json', 'phase112:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 112.2 Gremium View verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase112:2:verify'] = 'node scripts/v112-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 112.2 Gremium View patch applied.');
