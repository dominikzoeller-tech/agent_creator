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

write('frontend/lib/cmt-master-answer-log-list-filter-entry.ts', `import { getSecureMasterAnswerLogListFilterStatus, type SecureMasterAnswerLogListFilterStatus } from './cmt-master-answer-log-list-filter-status';

export type SecureMasterAnswerLogListFilterEntry = {
  phase: '131.2';
  label: 'Secure Master Local Answer Log List Filter Entry';
  status: SecureMasterAnswerLogListFilterStatus;
  primaryFilterPage: '/cmt/master/secure/main/log/list/filter';
  filterStatusPage: '/cmt/master/secure/main/log/list/filter/status';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  filterApi: '/api/cmt/master/secure/main/log/list/filter';
  recommendedUse: string[];
  sampleFilters: string[];
  visibleFilterFields: string[];
  safety: {
    localTestable: true;
    localSearchVisible: true;
    routeFilterVisible: true;
    intentFilterVisible: true;
    privacyDecisionFilterVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListFilterEntry(): SecureMasterAnswerLogListFilterEntry {
  return {
    phase: '131.2',
    label: 'Secure Master Local Answer Log List Filter Entry',
    status: getSecureMasterAnswerLogListFilterStatus(),
    primaryFilterPage: '/cmt/master/secure/main/log/list/filter',
    filterStatusPage: '/cmt/master/secure/main/log/list/filter/status',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    filterApi: '/api/cmt/master/secure/main/log/list/filter',
    recommendedUse: [
      'Filterseite fuer lokale Suche und Filtertests verwenden.',
      'Statusseite zur Kontrolle der sichtbaren Filterfelder nutzen.',
      'Logliste als ungefilterte Kontrollseite behalten.',
      'Suche ueber inputPreview mit kurzen Stichworten testen.',
      'Route, Intent und Privacy-Entscheidung mit all oder exakten Werten testen.',
      'Persistenz, Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    sampleFilters: [
      'search=intern',
      'search=Gremium',
      'search=Trading',
      'route=all',
      'intent=all',
      'privacyDecision=all',
      'privacyDecision=local_only',
    ],
    visibleFilterFields: [
      'sourceCount',
      'filteredCount',
      'search',
      'route',
      'intent',
      'privacyDecision',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      localSearchVisible: true,
      routeFilterVisible: true,
      intentFilterVisible: true,
      privacyDecisionFilterVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 131.3: Secure Master Local Answer Log List Filter Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-entry';

export default function SecureMasterAnswerLogListFilterEntryPage() {
  const entry = getSecureMasterAnswerLogListFilterEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 131.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Lokale Filteransicht ist sichtbar. Noch keine dauerhafte Speicherung.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryFilterPage}>Filteransicht</Link></li>
          <li><Link href={entry.filterStatusPage}>Filter-Status</Link></li>
          <li><Link href={entry.listPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Filter-Felder</h3>
        <ul>{entry.visibleFilterFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sample Filters</h3>
        <ol>{entry.sampleFilters.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.safety.localTestable)}</li>
          <li>localSearchVisible: {String(entry.safety.localSearchVisible)}</li>
          <li>routeFilterVisible: {String(entry.safety.routeFilterVisible)}</li>
          <li>intentFilterVisible: {String(entry.safety.intentFilterVisible)}</li>
          <li>privacyDecisionFilterVisible: {String(entry.safety.privacyDecisionFilterVisible)}</li>
          <li>persistedInBrowser: {String(entry.safety.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(entry.safety.persistedOnServer)}</li>
          <li>liveModelEnabled: {String(entry.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE131_2.md', `# Phase 131.2 - Secure Master Local Answer Log List Filter Entry

Baut eine Entry-Seite fuer die lokale Filteransicht der In-Memory-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-entry.ts
- API: /api/cmt/master/secure/main/log/list/filter/entry
- UI: /cmt/master/secure/main/log/list/filter/entry
- Patch: scripts/p131-2.cjs
- Verify: scripts/v131-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list/filter/status
- /cmt/master/secure/main/log/list/filter/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- lokal testbar
- Filter-Entry sichtbar
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

write('scripts/v131-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', "phase: '131.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', "primaryFilterPage: '/cmt/master/secure/main/log/list/filter'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'localSearchVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'routeFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'intentFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'privacyDecisionFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/entry/route.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/entry/page.tsx', 'Sichtbare Filter-Felder'],
  ['README_PHASE131_2.md', 'Secure Master Local Answer Log List Filter Entry'],
  ['package.json', 'phase131:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.2 Secure Master Local Answer Log List Filter Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase131:2:verify'] = 'node scripts/v131-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 131.2 Secure Master Local Answer Log List Filter Entry patch applied.');
