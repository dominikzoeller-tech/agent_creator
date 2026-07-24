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

write('frontend/lib/cmt-master-main-view-status.ts', `import { getSecureMasterMainViewDemo, type SecureMasterMainViewModel } from './cmt-master-main-view-model';

export type SecureMasterMainViewStatus = {
  phase: '128.1';
  label: 'Secure Master Structured Main View Status';
  mainPage: '/cmt/master/secure';
  mainViewApi: '/api/cmt/master/secure/main/view';
  demo: SecureMasterMainViewModel;
  viewState: {
    structuredMainViewVisible: true;
    statusBadgesVisible: true;
    compactBlocksVisible: true;
    committeeCardsReadable: true;
    controlLinksVisible: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleBadges: string[];
  visibleSections: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterMainViewStatus(): SecureMasterMainViewStatus {
  return {
    phase: '128.1',
    label: 'Secure Master Structured Main View Status',
    mainPage: '/cmt/master/secure',
    mainViewApi: '/api/cmt/master/secure/main/view',
    demo: getSecureMasterMainViewDemo(),
    viewState: {
      structuredMainViewVisible: true,
      statusBadgesVisible: true,
      compactBlocksVisible: true,
      committeeCardsReadable: true,
      controlLinksVisible: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die Secure-Master-Hauptansicht ist strukturiert. Status-Badges, kompakte Antwortbloecke und lesbare Gremiumskarten sind lokal sichtbar. Provider, Internet und Live-Modell bleiben deaktiviert.',
    },
    visibleBadges: [
      'Route',
      'Intent',
      'Privacy Gate',
      'Gremium',
      'Live Model',
      'External Sharing',
      'Network',
    ],
    visibleSections: [
      'Frage an den Secure Master',
      'Status-Badges',
      'Kompakte Antwortbloecke',
      '5er-Gremium bei Bedarf',
      'Kontrollseiten',
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
      'Structured Main View Entry ergaenzen',
      'Strukturierte Hauptansicht dokumentieren',
      'Antwortbloecke noch kompakter machen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/view/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterMainViewStatus } from '../../../../../../../../lib/cmt-master-main-view-status';

export async function GET() {
  return NextResponse.json(getSecureMasterMainViewStatus());
}
`);

write('frontend/app/cmt/master/secure/main/view/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterMainViewStatus } from '../../../../../../../lib/cmt-master-main-view-status';

export default function SecureMasterMainViewStatusPage() {
  const status = getSecureMasterMainViewStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 128.1</h1>
        <h2>{status.label}</h2>
        <p>{status.viewState.summary}</p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>View State</h3>
        <ul>
          <li>structuredMainViewVisible: {String(status.viewState.structuredMainViewVisible)}</li>
          <li>statusBadgesVisible: {String(status.viewState.statusBadgesVisible)}</li>
          <li>compactBlocksVisible: {String(status.viewState.compactBlocksVisible)}</li>
          <li>committeeCardsReadable: {String(status.viewState.committeeCardsReadable)}</li>
          <li>controlLinksVisible: {String(status.viewState.controlLinksVisible)}</li>
          <li>liveModelEnabled: {String(status.viewState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.viewState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.viewState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.viewState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Badges</h3>
        <ul>{status.visibleBadges.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Bereiche</h3>
        <ul>{status.visibleSections.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>badges: {status.demo.badges.length}</li>
          <li>compactBlocks: {status.demo.compactBlocks.length}</li>
          <li>roleCards: {status.demo.roleCards.length}</li>
          <li>externalSharingAllowed: {String(status.demo.externalSharingAllowed)}</li>
        </ul>
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

write('README_PHASE128_1.md', `# Phase 128.1 - Secure Master Structured Main View Status

Baut eine Statusseite fuer die strukturierte Secure-Master-Hauptansicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-view-status.ts
- API: /api/cmt/master/secure/main/view/status
- UI: /cmt/master/secure/main/view/status
- Patch: scripts/p128-1.cjs
- Verify: scripts/v128-1.cjs

Hauptseite:

- /cmt/master/secure

Statusseite:

- /cmt/master/secure/main/view/status

Status:

- lokal testbar
- strukturierte Hauptansicht sichtbar
- Status-Badges sichtbar
- kompakte Antwortbloecke sichtbar
- Gremiumskarten lesbarer
- Kontrolllinks sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v128-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-status.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/lib/cmt-master-main-view-status.ts', "phase: '128.1'"],
  ['frontend/lib/cmt-master-main-view-status.ts', "mainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-view-status.ts', 'statusBadgesVisible: true'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'compactBlocksVisible: true'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/view/status/route.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/app/cmt/master/secure/main/view/status/page.tsx', 'View State'],
  ['frontend/app/cmt/master/secure/main/view/status/page.tsx', 'Sichtbare Badges'],
  ['README_PHASE128_1.md', 'Secure Master Structured Main View Status'],
  ['package.json', 'phase128:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.1 Secure Master Structured Main View Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase128:1:verify'] = 'node scripts/v128-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 128.1 Secure Master Structured Main View Status patch applied.');
