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

write('frontend/lib/cmt-master-secure-status.ts', `import { getSecureMasterDemo, type SecureMasterAgentResult } from './cmt-master-secure';

export type SecureMasterStatus = {
  phase: '122.1';
  label: 'Secure Master Agent Status';
  currentMode: 'secure-master-local-testable';
  mainPage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure';
  demo: SecureMasterAgentResult;
  capabilities: {
    masterRouterIntegrated: true;
    privacyGateIntegrated: true;
    privacyDecisionFlowIntegrated: true;
    committeeRoutingAvailable: true;
    directRoutingAvailable: true;
    toolRequiredRoutingAvailable: true;
    agentBuilderRoutingAvailable: true;
    externalSharingBlocked: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
  };
  testInputs: string[];
  nextMilestones: string[];
  safety: {
    provider: 'none';
    modelSelected: 'none';
    dryRunOnly: true;
    externalSharingAllowed: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    providerDispatchAllowed: false;
    finalDispatchBlocked: true;
  };
};

export function getSecureMasterStatus(): SecureMasterStatus {
  return {
    phase: '122.1',
    label: 'Secure Master Agent Status',
    currentMode: 'secure-master-local-testable',
    mainPage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure',
    demo: getSecureMasterDemo(),
    capabilities: {
      masterRouterIntegrated: true,
      privacyGateIntegrated: true,
      privacyDecisionFlowIntegrated: true,
      committeeRoutingAvailable: true,
      directRoutingAvailable: true,
      toolRequiredRoutingAvailable: true,
      agentBuilderRoutingAvailable: true,
      externalSharingBlocked: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
    },
    testInputs: [
      'Erklaere mir kurz, was der Master-Agent kann.',
      'Soll ich den Agenten live schalten oder erst verbessern?',
      'Hier ist eine interne Kalkulation fuer Kunde Muster. Bitte pruefen.',
      'Wie wird morgen das Wetter?',
      'Baue mir zukuenftig einen Trading-Agenten.',
      'Soll ich zur Entscheidung das Gremium fragen?',
    ],
    nextMilestones: [
      'Secure Master Agent als Haupt-Einstieg verlinken',
      'Antwortqualitaet lokal verbessern',
      'Gremium-Antworten in Secure Master sichtbarer machen',
      'Provider-Readiness erst nach stabilen lokalen Tests vorbereiten',
    ],
    safety: {
      provider: 'none',
      modelSelected: 'none',
      dryRunOnly: true,
      externalSharingAllowed: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      providerDispatchAllowed: false,
      finalDispatchBlocked: true,
    },
  };
}
`);

write('frontend/app/api/cmt/master/secure/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterStatus } from '../../../../../../lib/cmt-master-secure-status';

export async function GET() {
  return NextResponse.json(getSecureMasterStatus());
}
`);

write('frontend/app/cmt/master/secure/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterStatus } from '../../../../../lib/cmt-master-secure-status';

export default function SecureMasterStatusPage() {
  const status = getSecureMasterStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 122.1</h1>
        <h2>{status.label}</h2>
        <p><strong>Modus:</strong> {status.currentMode}</p>
        <p><Link href={status.mainPage}>Secure Master Agent öffnen</Link></p>
      </section>
      <section style={card}>
        <h3>Capabilities</h3>
        <ul>
          {Object.entries(status.capabilities).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testeingaben</h3>
        <ol>{status.testInputs.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>finalRoute: {status.demo.finalRoute}</li>
          <li>privacy.decision: {status.demo.privacy.decision.decision}</li>
          <li>requiresUserApproval: {String(status.demo.requiresUserApproval)}</li>
          <li>externalSharingAllowed: {String(status.demo.externalSharingAllowed)}</li>
        </ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>{Object.entries(status.safety).map(([key, value]) => <li key={key}>{String(value)}</li>)}</ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE122_1.md', `# Phase 122.1 - Secure Master Agent Status

Statusseite fuer den Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-secure-status.ts
- API: /api/cmt/master/secure/status
- UI: /cmt/master/secure/status
- Patch: scripts/p122-1.cjs
- Verify: scripts/v122-1.cjs

Status:

- secure-master-local-testable
- Master Router integriert
- Privacy Gate integriert
- Privacy Decision Flow integriert
- kein Provider
- kein Internet
- kein Live-Modell
- externalSharingAllowed = false
`);

write('scripts/v122-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-secure-status.ts', 'getSecureMasterStatus'],
  ['frontend/lib/cmt-master-secure-status.ts', "phase: '122.1'"],
  ['frontend/lib/cmt-master-secure-status.ts', "currentMode: 'secure-master-local-testable'"],
  ['frontend/lib/cmt-master-secure-status.ts', 'privacyGateIntegrated: true'],
  ['frontend/lib/cmt-master-secure-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/status/route.ts', 'getSecureMasterStatus'],
  ['frontend/app/cmt/master/secure/status/page.tsx', 'Phase 122.1'],
  ['frontend/app/cmt/master/secure/status/page.tsx', 'Capabilities'],
  ['README_PHASE122_1.md', 'Secure Master Agent Status'],
  ['package.json', 'phase122:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.1 Secure Master Agent Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase122:1:verify'] = 'node scripts/v122-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 122.1 Secure Master Agent Status patch applied.');
