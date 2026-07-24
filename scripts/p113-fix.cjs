const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};

write('frontend/lib/cmt-hist.ts', `import { createCommitteeView, type CommitteeView } from './cmt-view';

export type CommitteeHistoryItem = {
  id: string;
  title: string;
  question: string;
  createdAt: string;
  view: CommitteeView;
};

export type CommitteeHistory = {
  phase: '113.0';
  label: 'Gremium History';
  items: CommitteeHistoryItem[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeHistory(questions: string[]): CommitteeHistory {
  const safeQuestions = questions.length > 0 ? questions : [
    'Soll das Gremium die Entscheidung bewerten?',
    'Welche Risiken sieht das Gremium?',
    'Welche naechsten Schritte empfiehlt das Gremium?',
  ];

  return {
    phase: '113.0',
    label: 'Gremium History',
    items: safeQuestions.map((question, index) => ({
      id: 'ch-demo-113-0-' + String(index + 1),
      title: 'Gremiumsfrage ' + String(index + 1),
      question,
      createdAt: 'dry-run',
      view: createCommitteeView(question),
    })),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeHistoryDemo() {
  return createCommitteeHistory([
    'Soll der Agent einen Verlauf fuer Gremiumsfragen anzeigen?',
    'Welche Risiken muss der Verlauf beachten?',
    'Welche naechsten Schritte braucht der MVP?',
  ]);
}
`);

write('frontend/app/api/cmt/hist/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeHistory, getCommitteeHistoryDemo } from '../../../../lib/cmt-hist';

export async function GET() {
  return NextResponse.json(getCommitteeHistoryDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteeHistory(questions));
}
`);

write('frontend/app/cmt/hist/page.tsx', `import { getCommitteeHistoryDemo } from '../../../lib/cmt-hist';

export default function CommitteeHistoryPage() {
  const history = getCommitteeHistoryDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.0</h1>
      <h2>{history.label}</h2>
      <p>Der Gremium-Agent zeigt einen ersten dry-run-only Verlauf bisheriger Gremiumsfragen.</p>

      <section style={{ display: 'grid', gap: 12 }}>
        {history.items.map((item) => (
          <article key={item.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
            <h3>{item.title}</h3>
            <p><strong>Frage:</strong> {item.question}</p>
            <p><strong>Entscheidung:</strong> {item.view.panels.decision}</p>
            <p><strong>Antwort:</strong> {item.view.panels.answer}</p>
            <h4>Aktionen</h4>
            <ul>{item.view.panels.actions.map((action) => <li key={action}>{action}</li>)}</ul>
          </article>
        ))}
      </section>
    </main>
  );
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
      const questions = text.split(String.fromCharCode(10)).map((line) => line.trim()).filter(Boolean);
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

write('scripts/v113-fix.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-hist.ts', 'createCommitteeHistory'],
  ['frontend/app/api/cmt/hist/route.ts', 'createCommitteeHistory'],
  ['frontend/app/cmt/hist/page.tsx', 'Phase 113.0'],
  ['frontend/app/cmt/save/page.tsx', 'String.fromCharCode(10)'],
  ['frontend/app/cmt/save/page.tsx', 'Session speichern'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113 hotfix verification OK.');
`);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase113:fix:verify'] = 'node scripts/v113-fix.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('UPDATED package.json');
console.log('Phase 113 hotfix patch applied.');
