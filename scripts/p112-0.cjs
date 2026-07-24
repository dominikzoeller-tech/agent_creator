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

write('frontend/lib/cmt-ask.ts', `import { createCommitteeBrief, type CommitteeBrief } from './cmt-brief';

export type CommitteeAskState = {
  phase: '112.0';
  label: 'Gremium Ask UI';
  inputPlaceholder: string;
  sampleQuestion: string;
  result: CommitteeBrief;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeAskState(question: string): CommitteeAskState {
  const safeQuestion = question.trim() || 'Soll ich diese Entscheidung mit dem Gremium bewerten?';
  return {
    phase: '112.0',
    label: 'Gremium Ask UI',
    inputPlaceholder: 'Stelle dem Gremium eine Frage...',
    sampleQuestion: safeQuestion,
    result: createCommitteeBrief(safeQuestion),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeAskDemo() {
  return createCommitteeAskState('Soll der Agent eine echte Eingabe-UI fuer Nutzerfragen an das Gremium anzeigen?');
}
`);

write('frontend/app/api/cmt/ask/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeAskState, getCommitteeAskDemo } from '../../../../lib/cmt-ask';

export async function GET() {
  return NextResponse.json(getCommitteeAskDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeAskState(text));
}
`);

write('frontend/app/cmt/ask/page.tsx', `'use client';

import { useMemo, useState } from 'react';
import { createCommitteeAskState } from '../../../lib/cmt-ask';

export default function CommitteeAskPage() {
  const [question, setQuestion] = useState('Soll der Agent eine echte Eingabe-UI fuer Nutzerfragen an das Gremium anzeigen?');
  const state = useMemo(() => createCommitteeAskState(question), [question]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.0</h1>
      <h2>{state.label}</h2>
      <p>Erste echte Eingabe-UI fuer Nutzerfragen an das interne Gremium. Weiterhin dry-run-only.</p>

      <section>
        <h3>Frage an das Gremium</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={state.inputPlaceholder}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
      </section>

      <section>
        <h3>Kurzantwort</h3>
        <p>{state.result.brief.userMessage}</p>
        <ul>
          <li>decision: {state.result.brief.decision}</li>
          <li>headline: {state.result.brief.headline}</li>
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {state.result.brief.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Aktionen</h3>
        <ul>
          {state.result.brief.actions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {state.provider}</li>
          <li>modelSelected: {state.modelSelected}</li>
          <li>dryRunOnly: {String(state.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(state.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(state.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(state.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE112_0.md', `# Phase 112.0 - Gremium Ask UI

Baut die erste echte Eingabe-UI fuer Nutzerfragen an das Gremium.

Kurz-Namen:

- Store: frontend/lib/cmt-ask.ts
- API: /api/cmt/ask
- UI: /cmt/ask
- Patch: scripts/p112-0.cjs
- Verify: scripts/v112-0.cjs

Funktion:

- Frage im UI eingeben
- Gremium-Brief live dry-run-only berechnen
- Kurzantwort, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v112-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-ask.ts', 'getCommitteeAskDemo'],
  ['frontend/lib/cmt-ask.ts', "phase: '112.0'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask UI'"],
  ['frontend/lib/cmt-ask.ts', 'createCommitteeBrief'],
  ['frontend/lib/cmt-ask.ts', "provider: 'none'"],
  ['frontend/lib/cmt-ask.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-ask.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-ask.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/ask/route.ts', 'createCommitteeAskState'],
  ['frontend/app/cmt/ask/page.tsx', 'Phase 112.0'],
  ['frontend/app/cmt/ask/page.tsx', 'textarea'],
  ['README_PHASE112_0.md', 'Gremium Ask UI'],
  ['package.json', 'phase112:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 112.0 Gremium Ask UI verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase112:0:verify'] = 'node scripts/v112-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 112.0 Gremium Ask UI patch applied.');
