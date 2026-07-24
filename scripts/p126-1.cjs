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

write('frontend/lib/cmt-master-unified-status.ts', `import { getSecureMasterUnifiedDemo, type SecureMasterUnifiedResult } from './cmt-master-unified';

export type SecureMasterUnifiedStatus = {
  phase: '126.1';
  label: 'Secure Master Unified Status';
  mainUnifiedPage: '/cmt/master/secure/unified';
  mainSecurePage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure/unified';
  demo: SecureMasterUnifiedResult;
  unifiedState: {
    mainFlowAvailable: true;
    privacyGateVisibleWhenNeeded: true;
    qualityAnswerVisible: true;
    committeeVisibleWhenNeeded: true;
    safetyStateVisible: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleBlocks: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterUnifiedStatus(): SecureMasterUnifiedStatus {
  return {
    phase: '126.1',
    label: 'Secure Master Unified Status',
    mainUnifiedPage: '/cmt/master/secure/unified',
    mainSecurePage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure/unified',
    demo: getSecureMasterUnifiedDemo(),
    unifiedState: {
      mainFlowAvailable: true,
      privacyGateVisibleWhenNeeded: true,
      qualityAnswerVisible: true,
      committeeVisibleWhenNeeded: true,
      safetyStateVisible: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Der Secure Master Unified Flow ist lokal verfuegbar. Er kombiniert lokale Antwort, Routing, Privacy Gate, Gremium und Safety State ohne Provider oder Internet.',
    },
    visibleBlocks: [
      'Lokale Antwort',
      'Routing',
      'Privacy Gate bei Bedarf',
      '5er-Gremium bei Bedarf',
      'Safety',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Darfst du extern damit arbeiten?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Unified Flow als echte Hauptansicht in /cmt/master/secure einbauen',
      'Alte Einzel-Testseiten weiter als Kontrollseiten behalten',
      'Antwortbloecke optisch klarer strukturieren',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/unified/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterUnifiedStatus } from '../../../../../../../lib/cmt-master-unified-status';

export async function GET() {
  return NextResponse.json(getSecureMasterUnifiedStatus());
}
`);

write('frontend/app/cmt/master/secure/unified/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterUnifiedStatus } from '../../../../../../lib/cmt-master-unified-status';

export default function SecureMasterUnifiedStatusPage() {
  const status = getSecureMasterUnifiedStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 126.1</h1>
        <h2>{status.label}</h2>
        <p>{status.unifiedState.summary}</p>
        <p><Link href={status.mainUnifiedPage}>Unified Flow öffnen</Link></p>
        <p><Link href={status.mainSecurePage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Unified State</h3>
        <ul>
          <li>mainFlowAvailable: {String(status.unifiedState.mainFlowAvailable)}</li>
          <li>privacyGateVisibleWhenNeeded: {String(status.unifiedState.privacyGateVisibleWhenNeeded)}</li>
          <li>qualityAnswerVisible: {String(status.unifiedState.qualityAnswerVisible)}</li>
          <li>committeeVisibleWhenNeeded: {String(status.unifiedState.committeeVisibleWhenNeeded)}</li>
          <li>safetyStateVisible: {String(status.unifiedState.safetyStateVisible)}</li>
          <li>localOnly: {String(status.unifiedState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.unifiedState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.unifiedState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.unifiedState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.unifiedState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Blöcke</h3>
        <ul>{status.visibleBlocks.map((block) => <li key={block}>{block}</li>)}</ul>
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
          <li>showsPrivacyGate: {String(status.demo.showsPrivacyGate)}</li>
          <li>showsCommitteeWhenNeeded: {String(status.demo.showsCommitteeWhenNeeded)}</li>
          <li>blocks: {status.demo.unifiedAnswerBlocks.length}</li>
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

write('README_PHASE126_1.md', `# Phase 126.1 - Secure Master Unified Status

Baut eine Statusseite fuer den Secure Master Unified Main Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-master-unified-status.ts
- API: /api/cmt/master/secure/unified/status
- UI: /cmt/master/secure/unified/status
- Patch: scripts/p126-1.cjs
- Verify: scripts/v126-1.cjs

Haupt-Testseite:

- /cmt/master/secure/unified

Statusseite:

- /cmt/master/secure/unified/status

Status:

- lokal testbar
- Unified Flow sichtbar
- Privacy Gate bei Bedarf sichtbar
- Quality-Antwort sichtbar
- Gremium bei Bedarf sichtbar
- Safety State sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v126-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified-status.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/lib/cmt-master-unified-status.ts', "phase: '126.1'"],
  ['frontend/lib/cmt-master-unified-status.ts', "mainUnifiedPage: '/cmt/master/secure/unified'"],
  ['frontend/lib/cmt-master-unified-status.ts', 'privacyGateVisibleWhenNeeded: true'],
  ['frontend/lib/cmt-master-unified-status.ts', 'committeeVisibleWhenNeeded: true'],
  ['frontend/lib/cmt-master-unified-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/unified/status/route.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/app/cmt/master/secure/unified/status/page.tsx', 'Unified State'],
  ['frontend/app/cmt/master/secure/unified/status/page.tsx', 'Sichtbare Blöcke'],
  ['README_PHASE126_1.md', 'Secure Master Unified Status'],
  ['package.json', 'phase126:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.1 Secure Master Unified Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase126:1:verify'] = 'node scripts/v126-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 126.1 Secure Master Unified Status patch applied.');
