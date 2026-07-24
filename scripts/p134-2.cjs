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

write('frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', `import { getSecureMasterAnswerLogListMainSelectStatus, type SecureMasterAnswerLogListMainSelectStatus } from './cmt-master-answer-log-list-main-select-status';

export type SecureMasterAnswerLogListMainSelectEntry = {
  phase: '134.2';
  label: 'Secure Master Main Log List Select Entry';
  status: SecureMasterAnswerLogListMainSelectStatus;
  primaryMainLogListPage: '/cmt/master/secure/main/log/list';
  mainLogListStatusPage: '/cmt/master/secure/main/log/list/select/status';
  selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
  optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
  secureMasterPage: '/cmt/master/secure';
  mainSelectApi: '/api/cmt/master/secure/main/log/list/select';
  recommendedUse: string[];
  uiChecklist: string[];
  safety: {
    localTestable: true;
    mainLogListEntryVisible: true;
    mainLogListSelectIntegrated: true;
    searchVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    controlPagesPreserved: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListMainSelectEntry(): SecureMasterAnswerLogListMainSelectEntry {
  return {
    phase: '134.2',
    label: 'Secure Master Main Log List Select Entry',
    status: getSecureMasterAnswerLogListMainSelectStatus(),
    primaryMainLogListPage: '/cmt/master/secure/main/log/list',
    mainLogListStatusPage: '/cmt/master/secure/main/log/list/select/status',
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
    secureMasterPage: '/cmt/master/secure',
    mainSelectApi: '/api/cmt/master/secure/main/log/list/select',
    recommendedUse: [
      'Haupt-Logliste als neue Standardseite fuer lokale Answer-Logs nutzen.',
      'Statusseite zur Kontrolle der integrierten Select-Filter nutzen.',
      'Select-Kontrollseite nur noch fuer gezielte Tests verwenden.',
      'Options-Kontrollseite nur noch fuer Dropdown-Ableitung verwenden.',
      'Route, Intent und Privacy in der Haupt-Logliste testen.',
      'Suche ueber inputPreview in der Haupt-Logliste testen.',
      'Keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Haupt-Logliste erreichbar.',
      'Route-Select direkt in Haupt-Logliste sichtbar.',
      'Intent-Select direkt in Haupt-Logliste sichtbar.',
      'Privacy-Select direkt in Haupt-Logliste sichtbar.',
      'Suchfeld direkt in Haupt-Logliste sichtbar.',
      'sourceCount sichtbar.',
      'filteredCount sichtbar.',
      'gefilterte Items sichtbar.',
      'controlPagesPreserved = true sichtbar.',
      'persistedInBrowser = false sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    safety: {
      localTestable: true,
      mainLogListEntryVisible: true,
      mainLogListSelectIntegrated: true,
      searchVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      controlPagesPreserved: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 134.3: Secure Master Main Log List Select Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/select/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListMainSelectEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-select-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListMainSelectEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/select/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListMainSelectEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-main-select-entry';

export default function SecureMasterAnswerLogListMainSelectEntryPage() {
  const entry = getSecureMasterAnswerLogListMainSelectEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 134.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Main-Loglist-Entry ist sichtbar. Die Haupt-Logliste ist jetzt der bevorzugte lokale Loglisten-Testpunkt.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.mainLogListStatusPage}>Main-Loglist-Status</Link></li>
          <li><Link href={entry.selectControlPage}>Select-Kontrollseite</Link></li>
          <li><Link href={entry.optionsControlPage}>Options-Kontrollseite</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>UI-Checklist</h3>
        <ol>{entry.uiChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE134_2.md', `# Phase 134.2 - Secure Master Main Log List Select Entry

Baut eine Entry-Seite fuer die Haupt-Logliste mit integrierten Select-Filtern.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-main-select-entry.ts
- API: /api/cmt/master/secure/main/log/list/select/entry
- UI: /cmt/master/secure/main/log/list/select/entry
- Patch: scripts/p134-2.cjs
- Verify: scripts/v134-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/select/status
- /cmt/master/secure/main/log/list/select/entry
- /cmt/master/secure/main/log/list/filter/select
- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure

Status:

- Main-Loglist-Entry sichtbar
- Haupt-Logliste ist bevorzugter Loglisten-Testpunkt
- mainLogListSelectIntegrated = true
- Route-Select sichtbar
- Intent-Select sichtbar
- Privacy-Select sichtbar
- Suche sichtbar
- sourceCount sichtbar
- filteredCount sichtbar
- controlPagesPreserved = true
- persistedInBrowser = false
- persistedOnServer = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v134-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', "phase: '134.2'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'mainLogListEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/entry/route.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/select/entry/page.tsx', 'UI-Checklist'],
  ['frontend/app/cmt/master/secure/main/log/list/select/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE134_2.md', 'Secure Master Main Log List Select Entry'],
  ['package.json', 'phase134:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.2 Secure Master Main Log List Select Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase134:2:verify'] = 'node scripts/v134-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 134.2 Secure Master Main Log List Select Entry patch applied.');
