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

write('frontend/lib/cmt-save.ts', `import { createCommitteeHistory, type CommitteeHistory } from './cmt-hist';

export type CommitteeSavedSession = {
  phase: '113.1';
  label: 'Gremium Save';
  sessionKey: string;
  history: CommitteeHistory;
  savedCount: number;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSavedSession(questions: string[]): CommitteeSavedSession {
  const history = createCommitteeHistory(questions);
  return {
    phase: '113.1',
    label: 'Gremium Save',
    sessionKey: 'csave-demo-113-1',
    history,
    savedCount: history.items.length,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSavedSessionDemo() {
  return createCommitteeSavedSession([
    'Soll der Agent Gremiumsfragen als Session speichern?',
    'Welche Entscheidung wurde zuletzt bewertet?',
    'Welche Aktion soll als naechstes umgesetzt werden?',
  ]);
}
`);

write('frontend/app/api/cmt/save/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeSavedSession, getCommitteeSavedSessionDemo } from '../../../../lib/cmt-save';

export async function GET() {
  return NextResponse.json(getCommitteeSavedSessionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteeSavedSession(questions));
}
`);

write('frontend/app/cmt/save/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeSavedSession } from '../../../lib/cmt-save';

export default function CommitteeSavePage() {
  const [text, setText] = useState('Soll der Agent Gremiumsfragen als Session speichern?');
  const [saved, setSaved] = useState<CommitteeSavedSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const questions = text.split('\n').map((line) => line.trim()).filter(Boolean);
      const response = await fetch('/api/cmt/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await response.json();
      setSaved(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.1</h1>
      <h2>Gremium Save</h2>
      <p>Mehrere Gremiumsfragen werden als dry-run-only Session gesammelt und angezeigt.</p>

      <section>
        <h3>Fragen</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={save} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Session wird gespeichert...' : 'Session speichern'}
        </button>
      </section>

      {saved && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <h3>Gespeicherte Session</h3>
          <p>sessionKey: {saved.sessionKey}</p>
          <p>savedCount: {saved.savedCount}</p>
          {saved.history.items.map((item) => (
            <article key={item.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{item.title}</h4>
              <p>{item.question}</p>
              <p><strong>decision:</strong> {item.view.panels.decision}</p>
            </article>
          ))}
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

write('README_PHASE113_1.md', `# Phase 113.1 - Gremium Save

Baut eine erste dry-run-only Session-Speicherung fuer Gremiumsfragen.

Kurz-Namen:

- Store: frontend/lib/cmt-save.ts
- API: /api/cmt/save
- UI: /cmt/save
- Patch: scripts/p113-1.cjs
- Verify: scripts/v113-1.cjs

Funktion:

- mehrere Fragen sammeln
- Session-Key setzen
- Verlauf wiederverwenden
- gespeicherte Session anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v113-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-save.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-save.ts', 'getCommitteeSavedSessionDemo'],
  ['frontend/lib/cmt-save.ts', "phase: '113.1'"],
  ['frontend/lib/cmt-save.ts', "label: 'Gremium Save'"],
  ['frontend/lib/cmt-save.ts', 'createCommitteeHistory'],
  ['frontend/lib/cmt-save.ts', "provider: 'none'"],
  ['frontend/lib/cmt-save.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-save.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/save/route.ts', 'createCommitteeSavedSession'],
  ['frontend/app/cmt/save/page.tsx', 'Session speichern'],
  ['frontend/app/cmt/save/page.tsx', "fetch('/api/cmt/save'"],
  ['README_PHASE113_1.md', 'Gremium Save'],
  ['package.json', 'phase113:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113.1 Gremium Save verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase113:1:verify'] = 'node scripts/v113-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 113.1 Gremium Save patch applied.');
