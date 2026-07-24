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

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {history.provider}</li>
          <li>modelSelected: {history.modelSelected}</li>
          <li>dryRunOnly: {String(history.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(history.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(history.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(history.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE113_0.md', `# Phase 113.0 - Gremium History

Baut den ersten Session-Verlauf fuer Gremiumsfragen.

Kurz-Namen:

- Store: frontend/lib/cmt-hist.ts
- API: /api/cmt/hist
- UI: /cmt/hist
- Patch: scripts/p113-0.cjs
- Verify: scripts/v113-0.cjs

Funktion:

- mehrere Gremiumsfragen als Verlauf anzeigen
- bestehende Gremium View wiederverwenden
- Entscheidung, Antwort und Aktionen je Frage anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v113-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-hist.ts', 'createCommitteeHistory'],
  ['frontend/lib/cmt-hist.ts', 'getCommitteeHistoryDemo'],
  ['frontend/lib/cmt-hist.ts', "phase: '113.0'"],
  ['frontend/lib/cmt-hist.ts', "label: 'Gremium History'"],
  ['frontend/lib/cmt-hist.ts', 'createCommitteeView'],
  ['frontend/lib/cmt-hist.ts', "provider: 'none'"],
  ['frontend/lib/cmt-hist.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-hist.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/hist/route.ts', 'createCommitteeHistory'],
  ['frontend/app/cmt/hist/page.tsx', 'Phase 113.0'],
  ['README_PHASE113_0.md', 'Gremium History'],
  ['package.json', 'phase113:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113.0 Gremium History verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase113:0:verify'] = 'node scripts/v113-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 113.0 Gremium History patch applied.');
