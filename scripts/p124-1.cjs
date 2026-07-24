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

write('frontend/lib/cmt-master-quality-status.ts', `import { getSecureMasterQualityDemo, type SecureMasterQualityResult } from './cmt-master-quality';

export type SecureMasterQualityStatus = {
  phase: '124.1';
  label: 'Secure Master Quality Status';
  mainQualityPage: '/cmt/master/secure/quality';
  mainSecurePage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure/quality';
  demo: SecureMasterQualityResult;
  supportedIntents: string[];
  qualityState: {
    localAnswersImproved: true;
    intentDetectionEnabled: true;
    committeeDecisionVisible: true;
    privacyAnswerImproved: true;
    toolMissingCapabilityVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterQualityStatus(): SecureMasterQualityStatus {
  return {
    phase: '124.1',
    label: 'Secure Master Quality Status',
    mainQualityPage: '/cmt/master/secure/quality',
    mainSecurePage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure/quality',
    demo: getSecureMasterQualityDemo(),
    supportedIntents: [
      'general',
      'live_switch',
      'internal_data',
      'committee_decision',
      'tool_required',
      'agent_builder',
      'project_next_step',
    ],
    qualityState: {
      localAnswersImproved: true,
      intentDetectionEnabled: true,
      committeeDecisionVisible: true,
      privacyAnswerImproved: true,
      toolMissingCapabilityVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale Antwortqualitaet ist verbessert. Der Secure Master erkennt mehrere Absichten und gibt klarere lokale Antworten ohne Provider oder Internet.',
    },
    testPrompts: [
      'Soll ich den Agenten jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie wird morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
      'Was ist der naechste Projektschritt?',
    ],
    nextMilestones: [
      'Qualitaetslogik in Hauptseite /cmt/master/secure integrieren',
      '5er-Gremium direkt in der Secure-Master-Antwort anzeigen',
      'Antwortstruktur fuer Nutzerfragen vereinheitlichen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/quality/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterQualityStatus } from '../../../../../../../lib/cmt-master-quality-status';

export async function GET() {
  return NextResponse.json(getSecureMasterQualityStatus());
}
`);

write('frontend/app/cmt/master/secure/quality/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterQualityStatus } from '../../../../../../lib/cmt-master-quality-status';

export default function SecureMasterQualityStatusPage() {
  const status = getSecureMasterQualityStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 124.1</h1>
        <h2>{status.label}</h2>
        <p>{status.qualityState.summary}</p>
        <p><Link href={status.mainQualityPage}>Quality-Testseite öffnen</Link></p>
        <p><Link href={status.mainSecurePage}>Secure Master öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Quality State</h3>
        <ul>
          <li>localAnswersImproved: {String(status.qualityState.localAnswersImproved)}</li>
          <li>intentDetectionEnabled: {String(status.qualityState.intentDetectionEnabled)}</li>
          <li>committeeDecisionVisible: {String(status.qualityState.committeeDecisionVisible)}</li>
          <li>privacyAnswerImproved: {String(status.qualityState.privacyAnswerImproved)}</li>
          <li>toolMissingCapabilityVisible: {String(status.qualityState.toolMissingCapabilityVisible)}</li>
          <li>liveModelEnabled: {String(status.qualityState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.qualityState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.qualityState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.qualityState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Unterstützte Intents</h3>
        <ul>{status.supportedIntents.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>detectedIntent: {status.demo.detectedIntent}</li>
          <li>finalRoute: {status.demo.finalRoute}</li>
          <li>committeeRolesVisible: {String(status.demo.committeeRolesVisible)}</li>
          <li>missingCapability: {status.demo.missingCapability || 'none'}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE124_1.md', `# Phase 124.1 - Secure Master Quality Status

Baut eine Statusseite fuer die lokale Antwortqualitaet des Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-quality-status.ts
- API: /api/cmt/master/secure/quality/status
- UI: /cmt/master/secure/quality/status
- Patch: scripts/p124-1.cjs
- Verify: scripts/v124-1.cjs

Haupt-Testseite:

- /cmt/master/secure/quality

Statusseite:

- /cmt/master/secure/quality/status

Status:

- lokal testbar
- Antwortqualitaet verbessert
- Intent-Erkennung sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v124-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality-status.ts', 'getSecureMasterQualityStatus'],
  ['frontend/lib/cmt-master-quality-status.ts', "phase: '124.1'"],
  ['frontend/lib/cmt-master-quality-status.ts', "mainQualityPage: '/cmt/master/secure/quality'"],
  ['frontend/lib/cmt-master-quality-status.ts', 'localAnswersImproved: true'],
  ['frontend/lib/cmt-master-quality-status.ts', 'intentDetectionEnabled: true'],
  ['frontend/lib/cmt-master-quality-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/quality/status/route.ts', 'getSecureMasterQualityStatus'],
  ['frontend/app/cmt/master/secure/quality/status/page.tsx', 'Quality State'],
  ['frontend/app/cmt/master/secure/quality/status/page.tsx', 'Unterstützte Intents'],
  ['README_PHASE124_1.md', 'Secure Master Quality Status'],
  ['package.json', 'phase124:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.1 Secure Master Quality Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase124:1:verify'] = 'node scripts/v124-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 124.1 Secure Master Quality Status patch applied.');
