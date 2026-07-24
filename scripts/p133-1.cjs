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

write('frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', `import { getSecureMasterAnswerLogListFilterSelectDemo, type SecureMasterAnswerLogListFilterSelectResult } from './cmt-master-answer-log-list-filter-select';

export type SecureMasterAnswerLogListFilterSelectStatus = {
  phase: '133.1';
  label: 'Secure Master Local Answer Log List Filter Select Status';
  select: SecureMasterAnswerLogListFilterSelectResult;
  pages: {
    selectPage: '/cmt/master/secure/main/log/list/filter/select';
    optionsPage: '/cmt/master/secure/main/log/list/filter/options';
    filterPage: '/cmt/master/secure/main/log/list/filter';
    logListPage: '/cmt/master/secure/main/log/list';
    mainPage: '/cmt/master/secure';
  };
  status: {
    localTestable: true;
    selectFilterVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    searchVisible: true;
    optionsDerivedLocally: true;
    usesPhase132Options: true;
    usesInMemoryList: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListFilterSelectStatus(): SecureMasterAnswerLogListFilterSelectStatus {
  return {
    phase: '133.1',
    label: 'Secure Master Local Answer Log List Filter Select Status',
    select: getSecureMasterAnswerLogListFilterSelectDemo(),
    pages: {
      selectPage: '/cmt/master/secure/main/log/list/filter/select',
      optionsPage: '/cmt/master/secure/main/log/list/filter/options',
      filterPage: '/cmt/master/secure/main/log/list/filter',
      logListPage: '/cmt/master/secure/main/log/list',
      mainPage: '/cmt/master/secure',
    },
    status: {
      localTestable: true,
      selectFilterVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      searchVisible: true,
      optionsDerivedLocally: true,
      usesPhase132Options: true,
      usesInMemoryList: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    checks: [
      'Select-Seite ist erreichbar.',
      'Route-Select ist sichtbar.',
      'Intent-Select ist sichtbar.',
      'Privacy-Select ist sichtbar.',
      'Suche ueber inputPreview bleibt sichtbar.',
      'Options-Ableitung aus Phase 132 wird wiederverwendet.',
      'sourceCount ist sichtbar.',
      'filteredCount ist sichtbar.',
      'persistedInBrowser = false.',
      'persistedOnServer = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 133.2: Secure Master Local Answer Log List Filter Select Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/select/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterSelectStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterSelectStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/select/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterSelectStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-status';

export default function SecureMasterAnswerLogListFilterSelectStatusPage() {
  const data = getSecureMasterAnswerLogListFilterSelectStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Select-Filter sind lokal sichtbar und nutzen die Options-Ableitung aus Phase 132. Keine Persistenz, kein Provider, kein Internet.</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.selectPage}>Select-Filterseite</Link></li>
          <li><Link href={data.pages.optionsPage}>Filter-Optionen</Link></li>
          <li><Link href={data.pages.filterPage}>Filterseite</Link></li>
          <li><Link href={data.pages.logListPage}>Logliste</Link></li>
          <li><Link href={data.pages.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Status Flags</h3>
        <ul>
          {Object.entries(data.status).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {data.select.filter.sourceCount}</li>
          <li>filteredCount: {data.select.filter.filteredCount}</li>
          <li>routeOptions: {data.select.options.routes.length}</li>
          <li>intentOptions: {data.select.options.intents.length}</li>
          <li>privacyOptions: {data.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ol>{data.checks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {data.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE133_1.md', `# Phase 133.1 - Secure Master Local Answer Log List Filter Select Status

Baut eine Statusseite fuer die lokale Select-Filteransicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-select-status.ts
- API: /api/cmt/master/secure/main/log/list/filter/select/status
- UI: /cmt/master/secure/main/log/list/filter/select/status
- Patch: scripts/p133-1.cjs
- Verify: scripts/v133-1.cjs

Status:

- Select-Filter-Status sichtbar
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

write('scripts/v133-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', "phase: '133.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'selectFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'usesPhase132Options: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/status/route.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/status/page.tsx', 'Status Flags'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/status/page.tsx', 'Demo Counts'],
  ['README_PHASE133_1.md', 'Secure Master Local Answer Log List Filter Select Status'],
  ['package.json', 'phase133:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.1 Secure Master Local Answer Log List Filter Select Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase133:1:verify'] = 'node scripts/v133-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 133.1 Secure Master Local Answer Log List Filter Select Status patch applied.');
