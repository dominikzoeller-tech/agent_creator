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

write('frontend/lib/cmt-run.ts', `import { createCommitteeAskState, type CommitteeAskState } from './cmt-ask';

export type CommitteeRun = {
  phase: '112.1';
  label: 'Gremium Run';
  requestId: string;
  input: string;
  ask: CommitteeAskState;
  status: 'ready' | 'dry-run-complete';
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeRun(input: string): CommitteeRun {
  const safeInput = input.trim() || 'Welche Frage soll das Gremium bewerten?';
  return {
    phase: '112.1',
    label: 'Gremium Run',
    requestId: 'cr-demo-112-1',
    input: safeInput,
    ask: createCommitteeAskState(safeInput),
    status: 'dry-run-complete',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeRunDemo() {
  return createCommitteeRun('Soll die UI eine Frage per Button an das Gremium senden und ein Ergebnis anzeigen?');
}
`);

write('frontend/app/api/cmt/run/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeRun, getCommitteeRunDemo } from '../../../../lib/cmt-run';

export async function GET() {
  return NextResponse.json(getCommitteeRunDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeRun(text));
}
`);

write('frontend/app/cmt/run/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeRun } from '../../../lib/cmt-run';

export default function CommitteeRunPage() {
  const [text, setText] = useState('Soll die UI eine Frage per Button an das Gremium senden und ein Ergebnis anzeigen?');
  const [run, setRun] = useState<CommitteeRun | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setRun(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.1</h1>
      <h2>Gremium Run</h2>
      <p>Die Frage wird per Button dry-run-only an die lokale Gremium-API gesendet.</p>

      <section>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Gremium laeuft...' : 'Gremium fragen'}
        </button>
      </section>

      {run && (
        <section>
          <h3>Ergebnis</h3>
          <p>{run.ask.result.brief.userMessage}</p>
          <ul>
            <li>requestId: {run.requestId}</li>
            <li>status: {run.status}</li>
            <li>decision: {run.ask.result.brief.decision}</li>
          </ul>
          <h4>Aktionen</h4>
          <ul>{run.ask.result.brief.actions.map((action) => <li key={action}>{action}</li>)}</ul>
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

write('README_PHASE112_1.md', `# Phase 112.1 - Gremium Run

Baut den ersten Button-Flow fuer die Gremium-UI.

Kurz-Namen:

- Store: frontend/lib/cmt-run.ts
- API: /api/cmt/run
- UI: /cmt/run
- Patch: scripts/p112-1.cjs
- Verify: scripts/v112-1.cjs

Funktion:

- Frage im UI eingeben
- Frage per Button an lokale API senden
- Gremium-Ergebnis anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v112-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-run.ts', 'createCommitteeRun'],
  ['frontend/lib/cmt-run.ts', 'getCommitteeRunDemo'],
  ['frontend/lib/cmt-run.ts', "phase: '112.1'"],
  ['frontend/lib/cmt-run.ts', "label: 'Gremium Run'"],
  ['frontend/lib/cmt-run.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-run.ts', "provider: 'none'"],
  ['frontend/lib/cmt-run.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-run.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/run/route.ts', 'createCommitteeRun'],
  ['frontend/app/cmt/run/page.tsx', 'Gremium fragen'],
  ['frontend/app/cmt/run/page.tsx', "fetch('/api/cmt/run'"],
  ['README_PHASE112_1.md', 'Gremium Run'],
  ['package.json', 'phase112:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 112.1 Gremium Run verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase112:1:verify'] = 'node scripts/v112-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 112.1 Gremium Run patch applied.');
