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

write('frontend/lib/cmt-master-entry.ts', `import { getMasterAgentStatus, type MasterAgentStatus } from './cmt-master-status';

export type MasterAgentEntry = {
  phase: '120.2';
  label: 'Master Agent Entry';
  status: MasterAgentStatus;
  entry: {
    title: string;
    description: string;
    primaryHref: '/cmt/master';
    statusHref: '/cmt/master/status';
    committeeHref: '/cmt/ask';
    mode: 'local-router';
    visibleAsMainEntryCandidate: true;
  };
  capabilities: {
    directAnswer: true;
    committeeRouting: true;
    privacyGate: true;
    toolRequiredDetection: true;
    agentBuilderDetection: true;
    liveModel: false;
    internet: false;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getMasterAgentEntry(): MasterAgentEntry {
  const status = getMasterAgentStatus();
  return {
    phase: '120.2',
    label: 'Master Agent Entry',
    status,
    entry: {
      title: 'Master-Agent',
      description: 'Zentraler lokaler Einstieg: Direktantwort, Gremium, Privacy-Gate, Toolbedarf und Spezialagenten-Idee.',
      primaryHref: '/cmt/master',
      statusHref: '/cmt/master/status',
      committeeHref: '/cmt/ask',
      mode: 'local-router',
      visibleAsMainEntryCandidate: true,
    },
    capabilities: {
      directAnswer: true,
      committeeRouting: true,
      privacyGate: true,
      toolRequiredDetection: true,
      agentBuilderDetection: true,
      liveModel: false,
      internet: false,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/master/entry/route.ts', `import { NextResponse } from 'next/server';
import { getMasterAgentEntry } from '../../../../../lib/cmt-master-entry';

export async function GET() {
  return NextResponse.json(getMasterAgentEntry());
}
`);

write('frontend/app/cmt/master/entry/page.tsx', `import Link from 'next/link';
import { getMasterAgentEntry } from '../../../../lib/cmt-master-entry';

export default function MasterAgentEntryPage() {
  const entry = getMasterAgentEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 120.2</h1>
        <h2>{entry.entry.title}</h2>
        <p>{entry.entry.description}</p>
        <p><strong>Modus:</strong> {entry.entry.mode}</p>
        <p><Link href={entry.entry.primaryHref}>Master-Agent öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Zentrale Links</h3>
        <ul>
          <li><Link href={entry.entry.primaryHref}>Master-Agent Testseite</Link></li>
          <li><Link href={entry.entry.statusHref}>Master-Agent Status</Link></li>
          <li><Link href={entry.entry.committeeHref}>Gremium Ask</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Fähigkeiten aktuell</h3>
        <ul>
          <li>directAnswer: {String(entry.capabilities.directAnswer)}</li>
          <li>committeeRouting: {String(entry.capabilities.committeeRouting)}</li>
          <li>privacyGate: {String(entry.capabilities.privacyGate)}</li>
          <li>toolRequiredDetection: {String(entry.capabilities.toolRequiredDetection)}</li>
          <li>agentBuilderDetection: {String(entry.capabilities.agentBuilderDetection)}</li>
          <li>liveModel: {String(entry.capabilities.liveModel)}</li>
          <li>internet: {String(entry.capabilities.internet)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Status Snapshot</h3>
        <p>{entry.status.status.summary}</p>
        <p><strong>currentMode:</strong> {entry.status.status.currentMode}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {entry.provider}</li>
          <li>modelSelected: {entry.modelSelected}</li>
          <li>dryRunOnly: {String(entry.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(entry.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(entry.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(entry.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE120_2.md', `# Phase 120.2 - Master Agent Entry

Baut einen klaren Einstieg fuer den lokalen Master-Agent-Router.

Kurz-Namen:

- Store: frontend/lib/cmt-master-entry.ts
- API: /api/cmt/master/entry
- UI: /cmt/master/entry
- Patch: scripts/p120-2.cjs
- Verify: scripts/v120-2.cjs

Funktion:

- Master-Agent als zentralen Einstieg markieren
- Links auf Master-Agent, Status und Gremium Ask anzeigen
- aktuelle Faehigkeiten sichtbar machen
- klar: noch kein Live-Modell und kein Internet

Testseiten:

- /cmt/master/entry
- /cmt/master
- /cmt/master/status

Status:

- master-router-local-testable
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v120-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentEntry'],
  ['frontend/lib/cmt-master-entry.ts', "phase: '120.2'"],
  ['frontend/lib/cmt-master-entry.ts', "label: 'Master Agent Entry'"],
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-entry.ts', "primaryHref: '/cmt/master'"],
  ['frontend/lib/cmt-master-entry.ts', "statusHref: '/cmt/master/status'"],
  ['frontend/lib/cmt-master-entry.ts', "committeeHref: '/cmt/ask'"],
  ['frontend/lib/cmt-master-entry.ts', 'visibleAsMainEntryCandidate: true'],
  ['frontend/lib/cmt-master-entry.ts', 'liveModel: false'],
  ['frontend/lib/cmt-master-entry.ts', 'internet: false'],
  ['frontend/app/api/cmt/master/entry/route.ts', 'getMasterAgentEntry'],
  ['frontend/app/cmt/master/entry/page.tsx', 'Phase 120.2'],
  ['frontend/app/cmt/master/entry/page.tsx', 'Zentrale Links'],
  ['README_PHASE120_2.md', 'Master Agent Entry'],
  ['package.json', 'phase120:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.2 Master Agent Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase120:2:verify'] = 'node scripts/v120-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 120.2 Master Agent Entry patch applied.');
