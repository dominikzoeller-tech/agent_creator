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

write('frontend/lib/cmt-intake.ts', `import { committeeRoles, type CommitteeRoleId } from './cmt-store';

export type CommitteeQuestion = {
  id: string;
  text: string;
  createdAt: string;
  topic: 'strategy' | 'legal' | 'technical' | 'finance' | 'risk' | 'execution' | 'general';
  riskLevel: 'low' | 'medium' | 'high';
  selectedRoleIds: CommitteeRoleId[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

const keywordMap: Array<[CommitteeQuestion['topic'], string[]]> = [
  ['legal', ['recht', 'vertrag', 'haftung', 'datenschutz', 'compliance', 'regulatorisch', 'gesetz']],
  ['technical', ['technik', 'architektur', 'api', 'build', 'code', 'system', 'integration', 'datenbank']],
  ['finance', ['kosten', 'budget', 'umsatz', 'preis', 'roi', 'finanz', 'cashflow']],
  ['risk', ['risiko', 'gefahr', 'sicherheit', 'ausfall', 'fehler', 'schaden', 'kritisch']],
  ['execution', ['umsetzung', 'plan', 'schritte', 'timeline', 'lieferung', 'projekt', 'roadmap']],
  ['strategy', ['strategie', 'ziel', 'markt', 'positionierung', 'prioritaet', 'vision']],
];

export function classifyCommitteeTopic(text: string): CommitteeQuestion['topic'] {
  const lower = text.toLowerCase();
  const match = keywordMap.find(([, words]) => words.some((word) => lower.includes(word)));
  return match ? match[0] : 'general';
}

export function assessCommitteeRisk(text: string): CommitteeQuestion['riskLevel'] {
  const lower = text.toLowerCase();
  const high = ['kritisch', 'haftung', 'verlust', 'illegal', 'sicherheitsluecke', 'produktiv', 'extern'];
  const medium = ['risiko', 'budget', 'vertrag', 'datenschutz', 'deadline', 'kunde'];
  if (high.some((word) => lower.includes(word))) return 'high';
  if (medium.some((word) => lower.includes(word))) return 'medium';
  return 'low';
}

export function selectCommitteeRoles(topic: CommitteeQuestion['topic'], riskLevel: CommitteeQuestion['riskLevel']): CommitteeRoleId[] {
  const base: CommitteeRoleId[] = ['strategy', 'technical', 'risk', 'execution'];
  if (topic !== 'general' && !base.includes(topic as CommitteeRoleId)) base.push(topic as CommitteeRoleId);
  if (riskLevel !== 'low' && !base.includes('legal')) base.push('legal');
  if ((topic === 'finance' || riskLevel === 'high') && !base.includes('finance')) base.push('finance');
  return committeeRoles.filter((role) => base.includes(role.id)).map((role) => role.id);
}

export function createCommitteeQuestion(text: string): CommitteeQuestion {
  const safeText = text.trim() || 'Welche Entscheidung soll das Gremium bewerten?';
  const topic = classifyCommitteeTopic(safeText);
  const riskLevel = assessCommitteeRisk(safeText);
  return {
    id: 'cq-demo-110-1',
    text: safeText,
    createdAt: 'dry-run',
    topic,
    riskLevel,
    selectedRoleIds: selectCommitteeRoles(topic, riskLevel),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeIntakeDemo() {
  return createCommitteeQuestion('Soll unser Agent eine Nutzerfrage an ein internes Gremium routen?');
}
`);

write('frontend/app/api/cmt/intake/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeQuestion, getCommitteeIntakeDemo } from '../../../../lib/cmt-intake';

export async function GET() {
  return NextResponse.json(getCommitteeIntakeDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeQuestion(text));
}
`);

write('frontend/app/cmt/intake/page.tsx', `import { getCommitteeIntakeDemo } from '../../../lib/cmt-intake';

export default function CommitteeIntakePage() {
  const demo = getCommitteeIntakeDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.1</h1>
      <h2>Question Intake und Gremium-Routing</h2>
      <p>Die Nutzerfrage wird dry-run-only klassifiziert und an passende Gremiumsrollen geroutet.</p>

      <section>
        <h3>Demo-Frage</h3>
        <p>{demo.text}</p>
        <ul>
          <li>topic: {demo.topic}</li>
          <li>riskLevel: {demo.riskLevel}</li>
          <li>selectedRoleIds: {demo.selectedRoleIds.join(', ')}</li>
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {demo.provider}</li>
          <li>modelSelected: {demo.modelSelected}</li>
          <li>dryRunOnly: {String(demo.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(demo.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(demo.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(demo.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE110_1.md', `# Phase 110.1 - Question Intake und Routing

Baut den ersten Frage-Intake fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-intake.ts
- API: /api/cmt/intake
- UI: /cmt/intake
- Patch: scripts/p110-1.cjs
- Verify: scripts/v110-1.cjs

Funktion:

- Frage entgegennehmen
- Thema klassifizieren
- Risiko einschaetzen
- passende Gremiumsrollen auswaehlen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v110-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-intake.ts', 'createCommitteeQuestion'],
  ['frontend/lib/cmt-intake.ts', 'classifyCommitteeTopic'],
  ['frontend/lib/cmt-intake.ts', 'assessCommitteeRisk'],
  ['frontend/lib/cmt-intake.ts', 'selectCommitteeRoles'],
  ['frontend/lib/cmt-intake.ts', "provider: 'none'"],
  ['frontend/lib/cmt-intake.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-intake.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-intake.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-intake.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-intake.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/intake/route.ts', 'createCommitteeQuestion'],
  ['frontend/app/cmt/intake/page.tsx', 'Phase 110.1'],
  ['README_PHASE110_1.md', 'Question Intake'],
  ['package.json', 'phase110:1:verify'],
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
console.log('Phase 110.1 Question Intake verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase110:1:verify'] = 'node scripts/v110-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 110.1 Question Intake patch applied.');
