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

write('frontend/lib/cmt-master-answer-log-list-filter-status.ts', `import { getSecureMasterAnswerLogListFilterDemo, type SecureMasterAnswerLogListFilterResult } from './cmt-master-answer-log-list-filter';

export type SecureMasterAnswerLogListFilterStatus = {
  phase: '131.1';
  label: 'Secure Master Local Answer Log List Filter Status';
  filterPage: '/cmt/master/secure/main/log/list/filter';
  filterApi: '/api/cmt/master/secure/main/log/list/filter';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogListFilterResult;
  filterState: {
    localSearchVisible: true;
    routeFilterVisible: true;
    intentFilterVisible: true;
    privacyDecisionFilterVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleFields: string[];
  testFilters: string[];
  nextMilestones: string[];
};

export function getSecureMasterAnswerLogListFilterStatus(): SecureMasterAnswerLogListFilterStatus {
  return {
    phase: '131.1',
    label: 'Secure Master Local Answer Log List Filter Status',
    filterPage: '/cmt/master/secure/main/log/list/filter',
    filterApi: '/api/cmt/master/secure/main/log/list/filter',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogListFilterDemo(),
    filterState: {
      localSearchVisible: true,
      routeFilterVisible: true,
      intentFilterVisible: true,
      privacyDecisionFilterVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale Filteransicht fuer die In-Memory-Logliste ist sichtbar. Suche, Route, Intent und Privacy-Entscheidung koennen lokal gefiltert werden. Es gibt weiterhin keine dauerhafte Speicherung.',
    },
    visibleFields: [
      'sourceCount',
      'filteredCount',
      'search',
      'route',
      'intent',
      'privacyDecision',
      'inputPreview',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    testFilters: [
      'search=intern',
      'search=Gremium',
      'route=all',
      'intent=all',
      'privacyDecision=local_only',
      'privacyDecision=all',
    ],
    nextMilestones: [
      'Filter Entry ergaenzen',
      'Filter Handoff ergaenzen',
      'Filterwerte spaeter als Dropdowns ableiten',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-status';

export default function SecureMasterAnswerLogListFilterStatusPage() {
  const status = getSecureMasterAnswerLogListFilterStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 131.1</h1>
        <h2>{status.label}</h2>
        <p>{status.filterState.summary}</p>
        <p><Link href={status.filterPage}>Filteransicht öffnen</Link></p>
        <p><Link href={status.listPage}>Logliste öffnen</Link></p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Filter State</h3>
        <ul>
          <li>localSearchVisible: {String(status.filterState.localSearchVisible)}</li>
          <li>routeFilterVisible: {String(status.filterState.routeFilterVisible)}</li>
          <li>intentFilterVisible: {String(status.filterState.intentFilterVisible)}</li>
          <li>privacyDecisionFilterVisible: {String(status.filterState.privacyDecisionFilterVisible)}</li>
          <li>sourceCountVisible: {String(status.filterState.sourceCountVisible)}</li>
          <li>filteredCountVisible: {String(status.filterState.filteredCountVisible)}</li>
          <li>usesInMemoryList: {String(status.filterState.usesInMemoryList)}</li>
          <li>persistedInBrowser: {String(status.filterState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.filterState.persistedOnServer)}</li>
          <li>localOnly: {String(status.filterState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.filterState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.filterState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.filterState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.filterState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>sourceCount: {status.demo.sourceCount}</li>
          <li>filteredCount: {status.demo.filteredCount}</li>
          <li>persistedInBrowser: {String(status.demo.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.demo.persistedOnServer)}</li>
          <li>externalSharingAllowed: {String(status.demo.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testfilter</h3>
        <ol>{status.testFilters.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE131_1.md', `# Phase 131.1 - Secure Master Local Answer Log List Filter Status

Baut eine Statusseite fuer die lokale Filteransicht der In-Memory-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-status.ts
- API: /api/cmt/master/secure/main/log/list/filter/status
- UI: /cmt/master/secure/main/log/list/filter/status
- Patch: scripts/p131-1.cjs
- Verify: scripts/v131-1.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list/filter/status
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- lokal testbar
- lokale Suche sichtbar
- Route-Filter sichtbar
- Intent-Filter sichtbar
- Privacy-Filter sichtbar
- sourceCount sichtbar
- filteredCount sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v131-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', "phase: '131.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', "filterPage: '/cmt/master/secure/main/log/list/filter'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'localSearchVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'routeFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'intentFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'privacyDecisionFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/status/route.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/status/page.tsx', 'Filter State'],
  ['README_PHASE131_1.md', 'Secure Master Local Answer Log List Filter Status'],
  ['package.json', 'phase131:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.1 Secure Master Local Answer Log List Filter Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase131:1:verify'] = 'node scripts/v131-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 131.1 Secure Master Local Answer Log List Filter Status patch applied.');
