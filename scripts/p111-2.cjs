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

write('frontend/lib/cmt-brief.ts', `import { createCommitteeDecisionResult, type CommitteeDecisionResult } from './cmt-result';

export type CommitteeBrief = {
  phase: '111.2';
  label: 'Gremium Brief';
  result: CommitteeDecisionResult;
  brief: {
    headline: string;
    decision: string;
    why: string[];
    risks: string[];
    actions: string[];
    userMessage: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeBrief(question: string): CommitteeBrief {
  const result = createCommitteeDecisionResult(question);
  const verdict = result.decision.verdict;
  const headline = verdict === 'proceed-dry-run'
    ? 'Gremium empfiehlt Fortsetzung im Dry-run.'
    : verdict === 'revise-before-proceeding'
      ? 'Gremium empfiehlt Ueberarbeitung vor Fortsetzung.'
      : 'Gremium blockiert Fortsetzung.';

  return {
    phase: '111.2',
    label: 'Gremium Brief',
    result,
    brief: {
      headline,
      decision: verdict,
      why: result.decision.rationale,
      risks: result.decision.risks,
      actions: result.decision.nextActions,
      userMessage: 'Kurzfassung: ' + headline + ' Die Details bleiben intern und dry-run-only.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeBriefDemo() {
  return createCommitteeBrief('Soll der Agent die Gremiumsentscheidung als kurze Nutzerantwort mit Risiken und Aktionen zusammenfassen?');
}
`);

write('frontend/app/api/cmt/brief/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeBrief, getCommitteeBriefDemo } from '../../../../lib/cmt-brief';

export async function GET() {
  return NextResponse.json(getCommitteeBriefDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeBrief(text));
}
`);

write('frontend/app/cmt/brief/page.tsx', `import { getCommitteeBriefDemo } from '../../../lib/cmt-brief';

export default function CommitteeBriefPage() {
  const brief = getCommitteeBriefDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.2</h1>
      <h2>{brief.label}</h2>
      <p>Das Gremium-Ergebnis wird als kurze Nutzerantwort mit Risiken und Aktionen verdichtet.</p>

      <section>
        <h3>Kurzantwort</h3>
        <p>{brief.brief.userMessage}</p>
        <ul>
          <li>headline: {brief.brief.headline}</li>
          <li>decision: {brief.brief.decision}</li>
        </ul>
      </section>

      <section>
        <h3>Warum</h3>
        <ul>
          {brief.brief.why.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {brief.brief.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Aktionen</h3>
        <ul>
          {brief.brief.actions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {brief.provider}</li>
          <li>modelSelected: {brief.modelSelected}</li>
          <li>dryRunOnly: {String(brief.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(brief.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(brief.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(brief.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE111_2.md', `# Phase 111.2 - Gremium Brief

Baut die verdichtete Nutzerantwort fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-brief.ts
- API: /api/cmt/brief
- UI: /cmt/brief
- Patch: scripts/p111-2.cjs
- Verify: scripts/v111-2.cjs

Funktion:

- Gremium-Ergebnis nutzen
- kurze Nutzerantwort erzeugen
- Entscheidung, Begruendung, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v111-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-brief.ts', 'createCommitteeBrief'],
  ['frontend/lib/cmt-brief.ts', 'getCommitteeBriefDemo'],
  ['frontend/lib/cmt-brief.ts', "phase: '111.2'"],
  ['frontend/lib/cmt-brief.ts', "label: 'Gremium Brief'"],
  ['frontend/lib/cmt-brief.ts', 'userMessage'],
  ['frontend/lib/cmt-brief.ts', 'actions'],
  ['frontend/lib/cmt-brief.ts', "provider: 'none'"],
  ['frontend/lib/cmt-brief.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-brief.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-brief.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-brief.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-brief.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/brief/route.ts', 'createCommitteeBrief'],
  ['frontend/app/cmt/brief/page.tsx', 'Phase 111.2'],
  ['README_PHASE111_2.md', 'Gremium Brief'],
  ['package.json', 'phase111:2:verify'],
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
console.log('Phase 111.2 Gremium Brief verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase111:2:verify'] = 'node scripts/v111-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 111.2 Gremium Brief patch applied.');
