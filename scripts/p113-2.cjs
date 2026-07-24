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

write('frontend/lib/cmt-sum.ts', `import { createCommitteeSavedSession, type CommitteeSavedSession } from './cmt-save';

export type CommitteeSessionSummary = {
  phase: '113.2';
  label: 'Gremium Summary';
  saved: CommitteeSavedSession;
  summary: {
    totalQuestions: number;
    decisions: string[];
    topRisks: string[];
    nextActions: string[];
    shortSummary: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSessionSummary(questions: string[]): CommitteeSessionSummary {
  const saved = createCommitteeSavedSession(questions);
  const decisions = saved.history.items.map((item) => item.view.panels.decision);
  const topRisks = Array.from(new Set(saved.history.items.flatMap((item) => item.view.panels.risks))).slice(0, 6);
  const nextActions = Array.from(new Set(saved.history.items.flatMap((item) => item.view.panels.actions))).slice(0, 6);

  return {
    phase: '113.2',
    label: 'Gremium Summary',
    saved,
    summary: {
      totalQuestions: saved.savedCount,
      decisions,
      topRisks,
      nextActions,
      shortSummary: 'Die gespeicherte Gremium-Session wurde dry-run-only zusammengefasst.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSessionSummaryDemo() {
  return createCommitteeSessionSummary([
    'Soll der Agent gespeicherte Gremiumsfragen zusammenfassen?',
    'Welche Risiken sind ueber mehrere Fragen hinweg wichtig?',
    'Welche Aktionen sollen als naechstes umgesetzt werden?',
  ]);
}
`);

write('frontend/app/api/cmt/sum/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeSessionSummary, getCommitteeSessionSummaryDemo } from '../../../../lib/cmt-sum';

export async function GET() {
  return NextResponse.json(getCommitteeSessionSummaryDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteeSessionSummary(questions));
}
`);

write('frontend/app/cmt/sum/page.tsx', `import { getCommitteeSessionSummaryDemo } from '../../../lib/cmt-sum';

export default function CommitteeSummaryPage() {
  const sum = getCommitteeSessionSummaryDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.2</h1>
      <h2>{sum.label}</h2>
      <p>Die gespeicherte Gremium-Session wird als dry-run-only Zusammenfassung angezeigt.</p>

      <section>
        <h3>Zusammenfassung</h3>
        <p>{sum.summary.shortSummary}</p>
        <ul>
          <li>sessionKey: {sum.saved.sessionKey}</li>
          <li>totalQuestions: {sum.summary.totalQuestions}</li>
        </ul>
      </section>

      <section>
        <h3>Entscheidungen</h3>
        <ul>{sum.summary.decisions.map((item, index) => <li key={item + index}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Top Risiken</h3>
        <ul>{sum.summary.topRisks.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Naechste Aktionen</h3>
        <ul>{sum.summary.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {sum.provider}</li>
          <li>modelSelected: {sum.modelSelected}</li>
          <li>dryRunOnly: {String(sum.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(sum.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(sum.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(sum.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE113_2.md', `# Phase 113.2 - Gremium Summary

Baut die erste Zusammenfassung fuer gespeicherte Gremiums-Sessions.

Kurz-Namen:

- Store: frontend/lib/cmt-sum.ts
- API: /api/cmt/sum
- UI: /cmt/sum
- Patch: scripts/p113-2.cjs
- Verify: scripts/v113-2.cjs

Funktion:

- gespeicherte Session nutzen
- Entscheidungen sammeln
- Risiken deduplizieren
- Aktionen deduplizieren
- Kurzsummary anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v113-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-sum.ts', 'createCommitteeSessionSummary'],
  ['frontend/lib/cmt-sum.ts', 'getCommitteeSessionSummaryDemo'],
  ['frontend/lib/cmt-sum.ts', "phase: '113.2'"],
  ['frontend/lib/cmt-sum.ts', "label: 'Gremium Summary'"],
  ['frontend/lib/cmt-sum.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-sum.ts', "provider: 'none'"],
  ['frontend/lib/cmt-sum.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-sum.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/sum/route.ts', 'createCommitteeSessionSummary'],
  ['frontend/app/cmt/sum/page.tsx', 'Phase 113.2'],
  ['README_PHASE113_2.md', 'Gremium Summary'],
  ['package.json', 'phase113:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113.2 Gremium Summary verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase113:2:verify'] = 'node scripts/v113-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 113.2 Gremium Summary patch applied.');
