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

write('frontend/lib/cmt-master-status.ts', `import { getMasterAgentDemo, type MasterAgentResult } from './cmt-master';

export type MasterAgentStatus = {
  phase: '120.1';
  label: 'Master Agent Router Status';
  demo: MasterAgentResult;
  status: {
    currentMode: 'master-router-local-testable';
    mainPage: '/cmt/master';
    apiRoute: '/api/cmt/master';
    routesSupported: string[];
    canAnswerDirect: true;
    canAskCommittee: true;
    canDetectPrivacyGate: true;
    canDetectToolRequired: true;
    canDetectAgentBuilder: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    summary: string;
  };
  testQuestions: string[];
  nextMilestones: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getMasterAgentStatus(): MasterAgentStatus {
  const demo = getMasterAgentDemo();
  return {
    phase: '120.1',
    label: 'Master Agent Router Status',
    demo,
    status: {
      currentMode: 'master-router-local-testable',
      mainPage: '/cmt/master',
      apiRoute: '/api/cmt/master',
      routesSupported: ['direct', 'committee', 'privacy_gate', 'tool_required', 'agent_builder'],
      canAnswerDirect: true,
      canAskCommittee: true,
      canDetectPrivacyGate: true,
      canDetectToolRequired: true,
      canDetectAgentBuilder: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      summary: 'Der Master-Agent-Router ist lokal testbar. Er entscheidet zwischen Direktantwort, Gremium, Privacy-Gate, Toolbedarf und Spezialagenten-Idee.',
    },
    testQuestions: [
      'Erklaere mir kurz den aktuellen Stand des Projekts.',
      'Soll ich den Gremium-Agenten jetzt live schalten?',
      'Hier ist eine interne Kalkulation fuer Kunde Muster, darfst du das auswerten?',
      'Wie wird das Wetter morgen?',
      'Baue mir spaeter einen Trading-Agenten.',
      'Lohnt sich ein Immobilienbewertungs-Agent fuer uns?',
    ],
    nextMilestones: [
      'Master-Agent UI klarer mit Hauptchat verbinden',
      'Datenschutz-Gate mit Freigabe-/Anonymisierungsoption ausbauen',
      'Provider-Readiness fuer echten KI-Modell-Test vorbereiten',
      'Spezialagenten-Entwurf als eigenen Flow vorbereiten',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/master/status/route.ts', `import { NextResponse } from 'next/server';
import { getMasterAgentStatus } from '../../../../../lib/cmt-master-status';

export async function GET() {
  return NextResponse.json(getMasterAgentStatus());
}
`);

write('frontend/app/cmt/master/status/page.tsx', `import Link from 'next/link';
import { getMasterAgentStatus } from '../../../../lib/cmt-master-status';

export default function MasterAgentStatusPage() {
  const status = getMasterAgentStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 120.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.mainPage}>Master-Agent öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Status</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>mainPage: {status.status.mainPage}</li>
          <li>apiRoute: {status.status.apiRoute}</li>
          <li>canAnswerDirect: {String(status.status.canAnswerDirect)}</li>
          <li>canAskCommittee: {String(status.status.canAskCommittee)}</li>
          <li>canDetectPrivacyGate: {String(status.status.canDetectPrivacyGate)}</li>
          <li>canDetectToolRequired: {String(status.status.canDetectToolRequired)}</li>
          <li>canDetectAgentBuilder: {String(status.status.canDetectAgentBuilder)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Routen</h3>
        <ul>{status.status.routesSupported.map((route) => <li key={route}>{route}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Testfragen</h3>
        <ol>{status.testQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <p><strong>Route:</strong> {status.demo.decision.route}</p>
        <p><strong>Grund:</strong> {status.demo.decision.reason}</p>
        <p><strong>Usable Status:</strong> {status.demo.usableStatus}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE120_1.md', `# Phase 120.1 - Master Agent Router Status

Baut eine Statusseite fuer den lokalen Master-Agent-Router.

Kurz-Namen:

- Store: frontend/lib/cmt-master-status.ts
- API: /api/cmt/master/status
- UI: /cmt/master/status
- Patch: scripts/p120-1.cjs
- Verify: scripts/v120-1.cjs

Funktion:

- aktuellen Master-Router-Status anzeigen
- unterstuetzte Routen anzeigen
- Testfragen anzeigen
- naechste Meilensteine anzeigen
- klare Aussage: noch nicht live mit KI-Modell

Status:

- master-router-local-testable
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v120-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-status.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-status.ts', "phase: '120.1'"],
  ['frontend/lib/cmt-master-status.ts', "label: 'Master Agent Router Status'"],
  ['frontend/lib/cmt-master-status.ts', "currentMode: 'master-router-local-testable'"],
  ['frontend/lib/cmt-master-status.ts', "mainPage: '/cmt/master'"],
  ['frontend/lib/cmt-master-status.ts', "apiRoute: '/api/cmt/master'"],
  ['frontend/lib/cmt-master-status.ts', 'canAskCommittee: true'],
  ['frontend/lib/cmt-master-status.ts', 'canDetectPrivacyGate: true'],
  ['frontend/lib/cmt-master-status.ts', 'canDetectAgentBuilder: true'],
  ['frontend/lib/cmt-master-status.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/master/status/route.ts', 'getMasterAgentStatus'],
  ['frontend/app/cmt/master/status/page.tsx', 'Phase 120.1'],
  ['frontend/app/cmt/master/status/page.tsx', 'Empfohlene Testfragen'],
  ['README_PHASE120_1.md', 'Master Agent Router Status'],
  ['package.json', 'phase120:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.1 Master Agent Router Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase120:1:verify'] = 'node scripts/v120-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 120.1 Master Agent Router Status patch applied.');
