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

write('frontend/lib/cmt-master-answer-log-list-json-export-status.ts', `import { getSecureMasterAnswerLogJsonExportDemo, type SecureMasterAnswerLogJsonExportPayload } from './cmt-master-answer-log-list-json-export';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonExportStatus = {
  phase: '137.1';
  label: 'Secure Master Answer Log JSON Export Status';
  exportDemo: SecureMasterAnswerLogJsonExportPayload;
  pages: {
    exportPage: '/cmt/master/secure/main/log/list/export-json';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status';
    secureMasterPage: '/cmt/master/secure';
  };
  exportStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
    exportPrepared: true;
    exportButtonVisible: true;
    jsonPayloadPrepared: true;
    downloadPrepared: true;
    importPreparedLater: true;
    includesLogs: true;
    includesFilters: true;
    includesPersistenceState: true;
    includesSafetyState: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonExportStatus(): SecureMasterAnswerLogJsonExportStatus {
  return {
    phase: '137.1',
    label: 'Secure Master Answer Log JSON Export Status',
    exportDemo: getSecureMasterAnswerLogJsonExportDemo(),
    pages: {
      exportPage: '/cmt/master/secure/main/log/list/export-json',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status',
      secureMasterPage: '/cmt/master/secure',
    },
    exportStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
      exportPrepared: true,
      exportButtonVisible: true,
      jsonPayloadPrepared: true,
      downloadPrepared: true,
      importPreparedLater: true,
      includesLogs: true,
      includesFilters: true,
      includesPersistenceState: true,
      includesSafetyState: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    checks: [
      'JSON-Export-Seite ist erreichbar.',
      'Export-Button ist sichtbar.',
      'Download ist vorbereitet.',
      'JSON-Payload ist vorbereitet.',
      'Logs sind enthalten.',
      'Filter sind enthalten.',
      'Persistence State ist enthalten.',
      'Safety State ist enthalten.',
      'Import ist fuer spaeter vorbereitet.',
      'Browser-Speicher bleibt erhalten.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 137.2: Secure Master Answer Log JSON Export Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/export-json/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonExportStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-export-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonExportStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/export-json/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonExportStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-json-export-status';

export default function SecureMasterAnswerLogJsonExportStatusPage() {
  const data = getSecureMasterAnswerLogJsonExportStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 137.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Lokaler JSON-Export ist vorbereitet. Import spaeter, keine Server-Persistenz.</p>
        <p><strong>Storage Key:</strong> {data.exportStatus.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.exportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.mainBrowserStoreStatusPage}>Main-Browser-Store-Status</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Export Status</h3>
        <ul>{Object.entries(data.exportStatus).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(data.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Payload Counts</h3>
        <ul>
          <li>sourceCount: {data.exportDemo.mainBrowserStore.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {data.exportDemo.mainBrowserStore.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {data.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {data.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {data.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
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

write('README_PHASE137_1.md', `# Phase 137.1 - Secure Master Answer Log JSON Export Status

Baut eine Statusseite fuer den lokalen JSON-Export der Haupt-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-export-status.ts
- API: /api/cmt/master/secure/main/log/list/export-json/status
- UI: /cmt/master/secure/main/log/list/export-json/status
- Patch: scripts/p137-1.cjs
- Verify: scripts/v137-1.cjs

Status:

- JSON-Export-Status sichtbar
- exportPrepared = true
- exportButtonVisible = true
- jsonPayloadPrepared = true
- downloadPrepared = true
- importPreparedLater = true
- includesLogs = true
- includesFilters = true
- includesPersistenceState = true
- includesSafetyState = true
- browserStorePreserved = true
- persistedInBrowser = browser_optional_local
- persistedOnServer = false
- serverStoragePrepared = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v137-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', "phase: '137.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'downloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/status/route.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/status/page.tsx', 'Export Status'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/status/page.tsx', 'Demo Payload Counts'],
  ['README_PHASE137_1.md', 'Secure Master Answer Log JSON Export Status'],
  ['package.json', 'phase137:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.1 Secure Master Answer Log JSON Export Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase137:1:verify'] = 'node scripts/v137-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 137.1 Secure Master Answer Log JSON Export Status patch applied.');
