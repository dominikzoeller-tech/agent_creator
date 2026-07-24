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

write('frontend/lib/cmt-master-main-status.ts', `import { getSecureMasterUnifiedStatus, type SecureMasterUnifiedStatus } from './cmt-master-unified-status';

export type SecureMasterMainStatus = {
  phase: '127.1';
  label: 'Secure Master Main View Status';
  mainPage: '/cmt/master/secure';
  unifiedControlPage: '/cmt/master/secure/unified';
  unifiedApiRoute: '/api/cmt/master/secure/unified';
  unifiedStatus: SecureMasterUnifiedStatus;
  mainState: {
    mainPageUsesUnifiedFlow: true;
    localAnswerVisible: true;
    routingVisible: true;
    privacyGateVisibleWhenNeeded: true;
    committeeVisibleWhenNeeded: true;
    safetyStateVisible: true;
    controlPagesKept: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  controlPages: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterMainStatus(): SecureMasterMainStatus {
  return {
    phase: '127.1',
    label: 'Secure Master Main View Status',
    mainPage: '/cmt/master/secure',
    unifiedControlPage: '/cmt/master/secure/unified',
    unifiedApiRoute: '/api/cmt/master/secure/unified',
    unifiedStatus: getSecureMasterUnifiedStatus(),
    mainState: {
      mainPageUsesUnifiedFlow: true,
      localAnswerVisible: true,
      routingVisible: true,
      privacyGateVisibleWhenNeeded: true,
      committeeVisibleWhenNeeded: true,
      safetyStateVisible: true,
      controlPagesKept: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die Hauptseite /cmt/master/secure nutzt jetzt den lokalen Unified Flow. Kontrollseiten bleiben erhalten. Provider, Internet und Live-Modell sind weiterhin deaktiviert.',
    },
    controlPages: [
      '/cmt/master/secure/unified',
      '/cmt/master/secure/unified/status',
      '/cmt/master/secure/unified/entry',
      '/cmt/master/secure/quality',
      '/cmt/master/secure/committee',
      '/cmt/privacy',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Daten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Hauptansicht optisch klarer machen',
      'Antwortbloecke kompakter anzeigen',
      'Status-Badges fuer Safety und Routing ergaenzen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterMainStatus } from '../../../../../../../lib/cmt-master-main-status';

export async function GET() {
  return NextResponse.json(getSecureMasterMainStatus());
}
`);

write('frontend/app/cmt/master/secure/main/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterMainStatus } from '../../../../../../lib/cmt-master-main-status';

export default function SecureMasterMainStatusPage() {
  const status = getSecureMasterMainStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 127.1</h1>
        <h2>{status.label}</h2>
        <p>{status.mainState.summary}</p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
        <p><Link href={status.unifiedControlPage}>Unified Kontrollseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Main State</h3>
        <ul>
          <li>mainPageUsesUnifiedFlow: {String(status.mainState.mainPageUsesUnifiedFlow)}</li>
          <li>localAnswerVisible: {String(status.mainState.localAnswerVisible)}</li>
          <li>routingVisible: {String(status.mainState.routingVisible)}</li>
          <li>privacyGateVisibleWhenNeeded: {String(status.mainState.privacyGateVisibleWhenNeeded)}</li>
          <li>committeeVisibleWhenNeeded: {String(status.mainState.committeeVisibleWhenNeeded)}</li>
          <li>safetyStateVisible: {String(status.mainState.safetyStateVisible)}</li>
          <li>controlPagesKept: {String(status.mainState.controlPagesKept)}</li>
          <li>liveModelEnabled: {String(status.mainState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.mainState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.mainState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.mainState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>{status.controlPages.map((href) => <li key={href}><Link href={href}>{href}</Link></li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE127_1.md', `# Phase 127.1 - Secure Master Main View Status

Baut eine Statusseite fuer die neue Hauptansicht /cmt/master/secure.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-status.ts
- API: /api/cmt/master/secure/main/status
- UI: /cmt/master/secure/main/status
- Patch: scripts/p127-1.cjs
- Verify: scripts/v127-1.cjs

Hauptseite:

- /cmt/master/secure

Statusseite:

- /cmt/master/secure/main/status

Status:

- lokal testbar
- Hauptseite nutzt Unified Flow
- lokale Antwort sichtbar
- Routing sichtbar
- Privacy Gate bei Bedarf sichtbar
- 5er-Gremium bei Bedarf sichtbar
- Safety State sichtbar
- Kontrollseiten bleiben erhalten
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v127-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-status.ts', 'getSecureMasterMainStatus'],
  ['frontend/lib/cmt-master-main-status.ts', "phase: '127.1'"],
  ['frontend/lib/cmt-master-main-status.ts', "mainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-status.ts', 'mainPageUsesUnifiedFlow: true'],
  ['frontend/lib/cmt-master-main-status.ts', 'controlPagesKept: true'],
  ['frontend/lib/cmt-master-main-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/status/route.ts', 'getSecureMasterMainStatus'],
  ['frontend/app/cmt/master/secure/main/status/page.tsx', 'Main State'],
  ['frontend/app/cmt/master/secure/main/status/page.tsx', 'Kontrollseiten'],
  ['README_PHASE127_1.md', 'Secure Master Main View Status'],
  ['package.json', 'phase127:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.1 Secure Master Main View Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase127:1:verify'] = 'node scripts/v127-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 127.1 Secure Master Main View Status patch applied.');
