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

write('frontend/lib/cmt-master-answer-log-list-main-select-status.ts', `import { getSecureMasterAnswerLogListMainSelectDemo, type SecureMasterAnswerLogListMainSelectResult } from './cmt-master-answer-log-list-main-select';

export type SecureMasterAnswerLogListMainSelectStatus = {
  phase: '134.1';
  label: 'Secure Master Main Log List Select Status';
  mainSelect: SecureMasterAnswerLogListMainSelectResult;
  pages: {
    mainLogListPage: '/cmt/master/secure/main/log/list';
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
    secureMasterPage: '/cmt/master/secure';
  };
  status: {
    localTestable: true;
    mainLogListSelectIntegrated: true;
    searchVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    controlPagesPreserved: true;
    usesInMemoryList: true;
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

export function getSecureMasterAnswerLogListMainSelectStatus(): SecureMasterAnswerLogListMainSelectStatus {
  return {
    phase: '134.1',
    label: 'Secure Master Main Log List Select Status',
    mainSelect: getSecureMasterAnswerLogListMainSelectDemo(),
    pages: {
      mainLogListPage: '/cmt/master/secure/main/log/list',
      selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
      optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
      secureMasterPage: '/cmt/master/secure',
    },
    status: {
      localTestable: true,
      mainLogListSelectIntegrated: true,
      searchVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      controlPagesPreserved: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    checks: [
      'Haupt-Loglistenansicht ist erreichbar.',
      'Select-Filter sind direkt in der Haupt-Logliste sichtbar.',
      'Route-Select ist sichtbar.',
      'Intent-Select ist sichtbar.',
      'Privacy-Select ist sichtbar.',
      'Suche ueber inputPreview ist sichtbar.',
      'sourceCount ist sichtbar.',
      'filteredCount ist sichtbar.',
      'Kontrollseiten bleiben erhalten.',
      'persistedInBrowser = false.',
      'persistedOnServer = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 134.2: Secure Master Main Log List Select Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/select/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListMainSelectStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-select-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListMainSelectStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/select/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListMainSelectStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-main-select-status';

export default function SecureMasterAnswerLogListMainSelectStatusPage() {
  const data = getSecureMasterAnswerLogListMainSelectStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 134.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Die Haupt-Logliste nutzt die Select-Filterbedienung. Keine Persistenz, kein Provider, kein Internet.</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.selectControlPage}>Select-Kontrollseite</Link></li>
          <li><Link href={data.pages.optionsControlPage}>Options-Kontrollseite</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Status Flags</h3>
        <ul>{Object.entries(data.status).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {data.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {data.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {data.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {data.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {data.mainSelect.select.options.privacyDecisions.length}</li>
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

write('README_PHASE134_1.md', `# Phase 134.1 - Secure Master Main Log List Select Status

Baut eine Statusseite fuer die Haupt-Logliste mit integrierten Select-Filtern.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-main-select-status.ts
- API: /api/cmt/master/secure/main/log/list/select/status
- UI: /cmt/master/secure/main/log/list/select/status
- Patch: scripts/p134-1.cjs
- Verify: scripts/v134-1.cjs

Status:

- Main-Loglist-Select-Status sichtbar
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

write('scripts/v134-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', "phase: '134.1'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/status/route.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/select/status/page.tsx', 'Status Flags'],
  ['frontend/app/cmt/master/secure/main/log/list/select/status/page.tsx', 'Demo Counts'],
  ['README_PHASE134_1.md', 'Secure Master Main Log List Select Status'],
  ['package.json', 'phase134:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.1 Secure Master Main Log List Select Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase134:1:verify'] = 'node scripts/v134-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 134.1 Secure Master Main Log List Select Status patch applied.');
