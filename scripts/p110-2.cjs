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

write('frontend/lib/cmt-delib.ts', `import { committeeRoles, type CommitteeRoleId } from './cmt-store';
import { createCommitteeQuestion, type CommitteeQuestion } from './cmt-intake';

export type CommitteeOpinion = {
  roleId: CommitteeRoleId;
  title: string;
  stance: 'support' | 'caution' | 'block' | 'needs-info';
  summary: string;
  concerns: string[];
  nextStep: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
};

export type CommitteeDeliberation = {
  phase: '110.2';
  label: 'Gremium Deliberation';
  question: CommitteeQuestion;
  opinions: CommitteeOpinion[];
  aggregate: {
    recommendation: 'proceed-dry-run' | 'revise-before-proceeding' | 'blocked';
    summary: string;
    mainRisks: string[];
    nextSteps: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function opinionFor(roleId: CommitteeRoleId, question: CommitteeQuestion): CommitteeOpinion {
  const role = committeeRoles.find((item) => item.id === roleId);
  const title = role?.title ?? roleId;
  const highRisk = question.riskLevel === 'high';
  const mediumRisk = question.riskLevel === 'medium';

  const stance: CommitteeOpinion['stance'] = highRisk && (roleId === 'legal' || roleId === 'risk')
    ? 'caution'
    : mediumRisk && roleId === 'risk'
      ? 'caution'
      : 'support';

  const concernByRole: Record<CommitteeRoleId, string[]> = {
    strategy: ['Zielbild und Prioritaet muessen klar bleiben.'],
    legal: ['Rechtliche und regulatorische Freigaben pruefen.'],
    technical: ['Technische Abhaengigkeiten und Schnittstellen validieren.'],
    finance: ['Budget, Aufwand und Nutzen transparent bewerten.'],
    risk: ['Risiken, Annahmen und Gegenmassnahmen dokumentieren.'],
    execution: ['Konkrete naechste Schritte und Verantwortlichkeiten festlegen.'],
  };

  const nextStepByRole: Record<CommitteeRoleId, string> = {
    strategy: 'Entscheidungsziel und Erfolgskriterien schriftlich festlegen.',
    legal: 'Compliance-/Datenschutz-Check vor echter Ausfuehrung vorbereiten.',
    technical: 'Technische Machbarkeit und Integrationspunkte pruefen.',
    finance: 'Aufwandsschaetzung und Nutzenhypothese ergaenzen.',
    risk: 'Risikoliste mit Gegenmassnahmen erstellen.',
    execution: 'Umsetzungsplan mit kleinem naechsten Schritt definieren.',
  };

  return {
    roleId,
    title,
    stance,
    summary: title + ' bewertet die Frage im Dry-run und liefert eine interne Einschaetzung ohne Provider-Call.',
    concerns: concernByRole[roleId],
    nextStep: nextStepByRole[roleId],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
  };
}

export function createCommitteeDeliberation(text: string): CommitteeDeliberation {
  const question = createCommitteeQuestion(text);
  const opinions = question.selectedRoleIds.map((roleId) => opinionFor(roleId, question));
  const cautionCount = opinions.filter((opinion) => opinion.stance === 'caution').length;
  const recommendation: CommitteeDeliberation['aggregate']['recommendation'] =
    question.riskLevel === 'high' || cautionCount > 1
      ? 'revise-before-proceeding'
      : 'proceed-dry-run';

  return {
    phase: '110.2',
    label: 'Gremium Deliberation',
    question,
    opinions,
    aggregate: {
      recommendation,
      summary: 'Das simulierte Gremium hat die Frage rollenbasiert bewertet. Ergebnis bleibt dry-run-only.',
      mainRisks: Array.from(new Set(opinions.flatMap((opinion) => opinion.concerns))),
      nextSteps: opinions.map((opinion) => opinion.nextStep),
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDeliberationDemo() {
  return createCommitteeDeliberation('Soll unser Agent eine Nutzerfrage an ein internes Gremium routen und eine Empfehlung erstellen?');
}
`);

write('frontend/app/api/cmt/delib/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeDeliberation, getCommitteeDeliberationDemo } from '../../../../lib/cmt-delib';

export async function GET() {
  return NextResponse.json(getCommitteeDeliberationDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDeliberation(text));
}
`);

write('frontend/app/cmt/delib/page.tsx', `import { getCommitteeDeliberationDemo } from '../../../lib/cmt-delib';

export default function CommitteeDeliberationPage() {
  const result = getCommitteeDeliberationDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.2</h1>
      <h2>{result.label}</h2>
      <p>Das interne Gremium erzeugt rollenbasierte Dry-run-Einschaetzungen und eine aggregierte Empfehlung.</p>

      <section>
        <h3>Frage</h3>
        <p>{result.question.text}</p>
        <ul>
          <li>topic: {result.question.topic}</li>
          <li>riskLevel: {result.question.riskLevel}</li>
          <li>recommendation: {result.aggregate.recommendation}</li>
        </ul>
      </section>

      <section>
        <h3>Rollenmeinungen</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {result.opinions.map((opinion) => (
            <article key={opinion.roleId} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{opinion.title}</h4>
              <p><strong>stance:</strong> {opinion.stance}</p>
              <p>{opinion.summary}</p>
              <p><strong>nextStep:</strong> {opinion.nextStep}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Aggregate</h3>
        <p>{result.aggregate.summary}</p>
        <ul>
          {result.aggregate.nextSteps.map((step) => <li key={step}>{step}</li>)}
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

write('README_PHASE110_2.md', `# Phase 110.2 - Gremium Deliberation

Baut die erste interne Gremiumsberatung fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-delib.ts
- API: /api/cmt/delib
- UI: /cmt/delib
- Patch: scripts/p110-2.cjs
- Verify: scripts/v110-2.cjs

Funktion:

- Frage aus Intake nutzen
- Rollenmeinungen erzeugen
- Risiken sammeln
- naechste Schritte aggregieren
- Empfehlung bilden

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v110-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-delib.ts', 'createCommitteeDeliberation'],
  ['frontend/lib/cmt-delib.ts', 'getCommitteeDeliberationDemo'],
  ['frontend/lib/cmt-delib.ts', "phase: '110.2'"],
  ['frontend/lib/cmt-delib.ts', "label: 'Gremium Deliberation'"],
  ['frontend/lib/cmt-delib.ts', 'CommitteeOpinion'],
  ['frontend/lib/cmt-delib.ts', 'recommendation'],
  ['frontend/lib/cmt-delib.ts', "provider: 'none'"],
  ['frontend/lib/cmt-delib.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-delib.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-delib.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-delib.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-delib.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/delib/route.ts', 'createCommitteeDeliberation'],
  ['frontend/app/cmt/delib/page.tsx', 'Phase 110.2'],
  ['README_PHASE110_2.md', 'Gremium Deliberation'],
  ['package.json', 'phase110:2:verify'],
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
console.log('Phase 110.2 Gremium Deliberation verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase110:2:verify'] = 'node scripts/v110-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 110.2 Gremium Deliberation patch applied.');
