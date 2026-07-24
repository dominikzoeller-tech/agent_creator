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

write('frontend/lib/cmt-result.ts', `import { createCommitteeSession, type CommitteeSession } from './cmt-session';

export type CommitteeDecisionResult = {
  phase: '111.1';
  label: 'Gremium Ergebnis';
  session: CommitteeSession;
  decision: {
    verdict: 'proceed-dry-run' | 'revise-before-proceeding' | 'blocked';
    shortAnswer: string;
    rationale: string[];
    risks: string[];
    nextActions: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDecisionResult(question: string): CommitteeDecisionResult {
  const session = createCommitteeSession(question);
  const deliberation = session.deliberation;
  return {
    phase: '111.1',
    label: 'Gremium Ergebnis',
    session,
    decision: {
      verdict: deliberation.aggregate.recommendation,
      shortAnswer: 'Das Gremium hat die Nutzerfrage dry-run-only bewertet und eine erste Handlungsempfehlung erstellt.',
      rationale: deliberation.opinions.map((opinion) => opinion.title + ': ' + opinion.stance),
      risks: deliberation.aggregate.mainRisks,
      nextActions: deliberation.aggregate.nextSteps,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDecisionResultDemo() {
  return createCommitteeDecisionResult('Soll der Agent die Gremiumsantwort als klares Ergebnis mit Risiken und naechsten Schritten anzeigen?');
}
`);

write('frontend/app/api/cmt/result/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeDecisionResult, getCommitteeDecisionResultDemo } from '../../../../lib/cmt-result';

export async function GET() {
  return NextResponse.json(getCommitteeDecisionResultDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDecisionResult(text));
}
`);

write('frontend/app/cmt/result/page.tsx', `import { getCommitteeDecisionResultDemo } from '../../../lib/cmt-result';

export default function CommitteeResultPage() {
  const result = getCommitteeDecisionResultDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.1</h1>
      <h2>{result.label}</h2>
      <p>Die Gremiumsberatung wird als klares Ergebnis mit Risiken und naechsten Schritten angezeigt.</p>

      <section>
        <h3>Antwort</h3>
        <p>{result.decision.shortAnswer}</p>
        <ul>
          <li>sessionId: {result.session.sessionId}</li>
          <li>verdict: {result.decision.verdict}</li>
        </ul>
      </section>

      <section>
        <h3>Begruendung</h3>
        <ul>
          {result.decision.rationale.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {result.decision.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Naechste Aktionen</h3>
        <ul>
          {result.decision.nextActions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {result.provider}</li>
          <li>modelSelected: {result.modelSelected}</li>
          <li>dryRunOnly: {String(result.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE111_1.md', `# Phase 111.1 - Gremium Ergebnis

Baut das erste klare Ergebnisobjekt fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-result.ts
- API: /api/cmt/result
- UI: /cmt/result
- Patch: scripts/p111-1.cjs
- Verify: scripts/v111-1.cjs

Funktion:

- Session nutzen
- Gremiumsberatung auswerten
- klares verdict anzeigen
- Begruendung, Risiken und naechste Aktionen ausgeben

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v111-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-result.ts', 'createCommitteeDecisionResult'],
  ['frontend/lib/cmt-result.ts', 'getCommitteeDecisionResultDemo'],
  ['frontend/lib/cmt-result.ts', "phase: '111.1'"],
  ['frontend/lib/cmt-result.ts', "label: 'Gremium Ergebnis'"],
  ['frontend/lib/cmt-result.ts', 'verdict'],
  ['frontend/lib/cmt-result.ts', 'nextActions'],
  ['frontend/lib/cmt-result.ts', "provider: 'none'"],
  ['frontend/lib/cmt-result.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-result.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-result.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-result.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-result.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/result/route.ts', 'createCommitteeDecisionResult'],
  ['frontend/app/cmt/result/page.tsx', 'Phase 111.1'],
  ['README_PHASE111_1.md', 'Gremium Ergebnis'],
  ['package.json', 'phase111:1:verify'],
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
console.log('Phase 111.1 Gremium Ergebnis verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase111:1:verify'] = 'node scripts/v111-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 111.1 Gremium Ergebnis patch applied.');
