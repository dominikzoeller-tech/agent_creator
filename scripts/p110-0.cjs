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

write('frontend/lib/cmt-store.ts', `export type CommitteeRoleId =
  | 'strategy'
  | 'legal'
  | 'technical'
  | 'finance'
  | 'risk'
  | 'execution';

export type CommitteeRole = {
  id: CommitteeRoleId;
  title: string;
  responsibility: string;
  defaultPerspective: string;
  enabled: true;
};

export type CommitteeCore = {
  phase: '110.0';
  label: 'Gremium Core';
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  roles: CommitteeRole[];
};

export const committeeRoles: CommitteeRole[] = [
  {
    id: 'strategy',
    title: 'Strategy',
    responsibility: 'Bewertet Zielbild, Nutzen, Prioritaet und strategische Passung.',
    defaultPerspective: 'Langfristiger Nutzen, Zielkonflikte, Positionierung und Entscheidungsklarheit.',
    enabled: true,
  },
  {
    id: 'legal',
    title: 'Legal',
    responsibility: 'Prueft rechtliche, regulatorische und vertragliche Risiken.',
    defaultPerspective: 'Compliance, Haftung, Datenschutz, Vertragslage und Freigabebedarf.',
    enabled: true,
  },
  {
    id: 'technical',
    title: 'Technical',
    responsibility: 'Bewertet Architektur, Machbarkeit, Abhaengigkeiten und technische Risiken.',
    defaultPerspective: 'Systemdesign, Umsetzbarkeit, Skalierung, Wartbarkeit und Integrationsrisiken.',
    enabled: true,
  },
  {
    id: 'finance',
    title: 'Finance',
    responsibility: 'Bewertet Kosten, Nutzen, Aufwand, Budget und wirtschaftliche Tragfaehigkeit.',
    defaultPerspective: 'ROI, Kostenrahmen, Opportunitaetskosten, Budgetwirkung und Zahlungsrisiken.',
    enabled: true,
  },
  {
    id: 'risk',
    title: 'Risk',
    responsibility: 'Identifiziert Risiken, Nebenwirkungen, Sicherheitsfragen und offene Annahmen.',
    defaultPerspective: 'Worst case, Eintrittswahrscheinlichkeit, Schadenshoehe und Gegenmassnahmen.',
    enabled: true,
  },
  {
    id: 'execution',
    title: 'Execution',
    responsibility: 'Bewertet Umsetzung, Reihenfolge, Abhaengigkeiten und konkrete naechste Schritte.',
    defaultPerspective: 'Operationalisierung, Meilensteine, Verantwortlichkeiten, Blocker und Lieferbarkeit.',
    enabled: true,
  },
];

export function getCommitteeCore(): CommitteeCore {
  return {
    phase: '110.0',
    label: 'Gremium Core',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    roles: committeeRoles,
  };
}
`);

write('frontend/app/api/cmt/route.ts', `import { NextResponse } from 'next/server';
import { getCommitteeCore } from '../../../lib/cmt-store';

export async function GET() {
  return NextResponse.json(getCommitteeCore());
}
`);

write('frontend/app/cmt/page.tsx', `import { getCommitteeCore } from '../../lib/cmt-store';

export default function CommitteeCorePage() {
  const core = getCommitteeCore();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.0</h1>
      <h2>{core.label}</h2>
      <p>Internes simuliertes Gremium. Keine Provider-Calls. Dry-run only.</p>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {core.provider}</li>
          <li>modelSelected: {core.modelSelected}</li>
          <li>dryRunOnly: {String(core.dryRunOnly)}</li>
          <li>finalDispatchBlocked: {String(core.finalDispatchBlocked)}</li>
          <li>executionGateClosed: {String(core.executionGateClosed)}</li>
          <li>networkCallAllowed: {String(core.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(core.providerDispatchAllowed)}</li>
        </ul>
      </section>

      <section>
        <h3>Gremiumsrollen</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {core.roles.map((role) => (
            <article key={role.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{role.title}</h4>
              <p><strong>ID:</strong> {role.id}</p>
              <p><strong>Aufgabe:</strong> {role.responsibility}</p>
              <p><strong>Perspektive:</strong> {role.defaultPerspective}</p>
              <p><strong>enabled:</strong> {String(role.enabled)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`);

write('README_PHASE110_0.md', `# Phase 110.0 - Gremium Core

Erster echter MVP-Baustein fuer den Gremium-Agenten.

Diese Phase baut ein internes simuliertes Gremium mit kurzen Namen:

- UI: /cmt
- API: /api/cmt
- Store: frontend/lib/cmt-store.ts
- Patch: scripts/p110-0.cjs
- Verify: scripts/v110-0.cjs

Rollen:

- strategy
- legal
- technical
- finance
- risk
- execution

Safety bleibt locked:

- provider = none
- modelSelected = none
- dryRunOnly = true
- finalDispatchBlocked = true
- executionGateClosed = true
- networkCallAllowed = false
- providerDispatchAllowed = false
`);

write('scripts/v110-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-store.ts', "phase: '110.0'"],
  ['frontend/lib/cmt-store.ts', "label: 'Gremium Core'"],
  ['frontend/lib/cmt-store.ts', "id: 'strategy'"],
  ['frontend/lib/cmt-store.ts', "id: 'legal'"],
  ['frontend/lib/cmt-store.ts', "id: 'technical'"],
  ['frontend/lib/cmt-store.ts', "id: 'finance'"],
  ['frontend/lib/cmt-store.ts', "id: 'risk'"],
  ['frontend/lib/cmt-store.ts', "id: 'execution'"],
  ['frontend/lib/cmt-store.ts', "provider: 'none'"],
  ['frontend/lib/cmt-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/cmt-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/cmt-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/route.ts', 'getCommitteeCore'],
  ['frontend/app/cmt/page.tsx', 'Phase 110.0'],
  ['README_PHASE110_0.md', 'Phase 110.0'],
  ['package.json', 'phase110:0:verify'],
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
console.log('Phase 110.0 Gremium Core verification OK.');
`);

const pkgPath = path.join(root, 'package.json');
const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase110:0:verify'] = 'node scripts/v110-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 110.0 Gremium Core patch applied.');
