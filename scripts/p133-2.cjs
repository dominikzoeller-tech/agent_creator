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

write('frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', `import { getSecureMasterAnswerLogListFilterSelectStatus, type SecureMasterAnswerLogListFilterSelectStatus } from './cmt-master-answer-log-list-filter-select-status';

export type SecureMasterAnswerLogListFilterSelectEntry = {
  phase: '133.2';
  label: 'Secure Master Local Answer Log List Filter Select Entry';
  status: SecureMasterAnswerLogListFilterSelectStatus;
  primarySelectPage: '/cmt/master/secure/main/log/list/filter/select';
  selectStatusPage: '/cmt/master/secure/main/log/list/filter/select/status';
  optionsPage: '/cmt/master/secure/main/log/list/filter/options';
  filterPage: '/cmt/master/secure/main/log/list/filter';
  logListPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  selectApi: '/api/cmt/master/secure/main/log/list/filter/select';
  recommendedUse: string[];
  uiChecklist: string[];
  safety: {
    localTestable: true;
    selectEntryVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    searchVisible: true;
    optionsDerivedLocally: true;
    usesPhase132Options: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListFilterSelectEntry(): SecureMasterAnswerLogListFilterSelectEntry {
  return {
    phase: '133.2',
    label: 'Secure Master Local Answer Log List Filter Select Entry',
    status: getSecureMasterAnswerLogListFilterSelectStatus(),
    primarySelectPage: '/cmt/master/secure/main/log/list/filter/select',
    selectStatusPage: '/cmt/master/secure/main/log/list/filter/select/status',
    optionsPage: '/cmt/master/secure/main/log/list/filter/options',
    filterPage: '/cmt/master/secure/main/log/list/filter',
    logListPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    selectApi: '/api/cmt/master/secure/main/log/list/filter/select',
    recommendedUse: [
      'Select-Seite als neue lokale Filter-Testseite nutzen.',
      'Optionen-Seite zur Kontrolle der lokal abgeleiteten Dropdown-Werte nutzen.',
      'Statusseite zur Kontrolle der Select-Safety-Flags nutzen.',
      'Route, Intent und Privacy jeweils ueber Select ausprobieren.',
      'Suche ueber inputPreview weiter testen.',
      'Keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Route-Select sichtbar.',
      'Intent-Select sichtbar.',
      'Privacy-Select sichtbar.',
      'Suchfeld sichtbar.',
      'sourceCount sichtbar.',
      'filteredCount sichtbar.',
      'gefilterte Items sichtbar.',
      'persistedInBrowser = false sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    safety: {
      localTestable: true,
      selectEntryVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      searchVisible: true,
      optionsDerivedLocally: true,
      usesPhase132Options: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 133.3: Secure Master Local Answer Log List Filter Select Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/select/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterSelectEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterSelectEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/select/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterSelectEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-entry';

export default function SecureMasterAnswerLogListFilterSelectEntryPage() {
  const entry = getSecureMasterAnswerLogListFilterSelectEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Select-Entry ist sichtbar. Lokale Dropdown-Filter sind vorbereitet. Keine Persistenz, kein Provider, kein Internet.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primarySelectPage}>Select-Filterseite</Link></li>
          <li><Link href={entry.selectStatusPage}>Select-Statusseite</Link></li>
          <li><Link href={entry.optionsPage}>Filter-Optionen</Link></li>
          <li><Link href={entry.filterPage}>Klassische Filterseite</Link></li>
          <li><Link href={entry.logListPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
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
          <li>sourceCount: {entry.status.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          {Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE133_2.md', `# Phase 133.2 - Secure Master Local Answer Log List Filter Select Entry

Baut eine Entry-Seite fuer die lokale Select-Filteransicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts
- API: /api/cmt/master/secure/main/log/list/filter/select/entry
- UI: /cmt/master/secure/main/log/list/filter/select/entry
- Patch: scripts/p133-2.cjs
- Verify: scripts/v133-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/filter/select
- /cmt/master/secure/main/log/list/filter/select/status
- /cmt/master/secure/main/log/list/filter/select/entry
- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- Select-Entry sichtbar
- Route-Select sichtbar
- Intent-Select sichtbar
- Privacy-Select sichtbar
- Suche sichtbar
- Options-Ableitung aus Phase 132 aktiv
- sourceCount sichtbar
- filteredCount sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v133-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', "phase: '133.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'selectEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'usesPhase132Options: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/entry/route.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/entry/page.tsx', 'UI-Checklist'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE133_2.md', 'Secure Master Local Answer Log List Filter Select Entry'],
  ['package.json', 'phase133:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.2 Secure Master Local Answer Log List Filter Select Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase133:2:verify'] = 'node scripts/v133-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 133.2 Secure Master Local Answer Log List Filter Select Entry patch applied.');
