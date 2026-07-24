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

write('frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', `import { getSecureMasterAnswerLogJsonExportStatus, type SecureMasterAnswerLogJsonExportStatus } from './cmt-master-answer-log-list-json-export-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonExportEntry = {
  phase: '137.2';
  label: 'Secure Master Answer Log JSON Export Entry';
  status: SecureMasterAnswerLogJsonExportStatus;
  primaryExportPage: '/cmt/master/secure/main/log/list/export-json';
  exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status';
  secureMasterPage: '/cmt/master/secure';
  exportApi: '/api/cmt/master/secure/main/log/list/export-json';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  exportState: {
    jsonExportEntryVisible: true;
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
    localTestable: true;
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonExportEntry(): SecureMasterAnswerLogJsonExportEntry {
  return {
    phase: '137.2',
    label: 'Secure Master Answer Log JSON Export Entry',
    status: getSecureMasterAnswerLogJsonExportStatus(),
    primaryExportPage: '/cmt/master/secure/main/log/list/export-json',
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status',
    secureMasterPage: '/cmt/master/secure',
    exportApi: '/api/cmt/master/secure/main/log/list/export-json',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'JSON-Export-Seite als lokalen Exportpunkt fuer Answer-Logs nutzen.',
      'Export vorbereiten und JSON herunterladen testen.',
      'JSON Preview auf Logs, Filter, Persistence State und Safety State pruefen.',
      'Statusseite zur Kontrolle der Export-Flags nutzen.',
      'Haupt-Logliste bleibt bevorzugter lokaler Loglisten-Testpunkt.',
      'Import noch nicht erwarten, nur vorbereitet.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'JSON-Export-Entry sichtbar.',
      'JSON-Export-Seite verlinkt.',
      'JSON-Export-Status verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'exportPrepared = true sichtbar.',
      'exportButtonVisible = true sichtbar.',
      'jsonPayloadPrepared = true sichtbar.',
      'downloadPrepared = true sichtbar.',
      'importPreparedLater = true sichtbar.',
      'includesLogs = true sichtbar.',
      'includesFilters = true sichtbar.',
      'includesPersistenceState = true sichtbar.',
      'includesSafetyState = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    exportState: {
      jsonExportEntryVisible: true,
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
      localTestable: true,
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    nextMilestone: 'Phase 137.3: Secure Master Answer Log JSON Export Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/export-json/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonExportEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-export-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonExportEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/export-json/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonExportEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-json-export-entry';

export default function SecureMasterAnswerLogJsonExportEntryPage() {
  const entry = getSecureMasterAnswerLogJsonExportEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 137.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> JSON-Export-Entry ist sichtbar. Lokaler Export ist vorbereitet, Import folgt spaeter.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryExportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={entry.exportStatusPage}>JSON-Export-Status</Link></li>
          <li><Link href={entry.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.mainBrowserStoreStatusPage}>Main-Browser-Store-Status</Link></li>
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
        <h3>Export State</h3>
        <ul>{Object.entries(entry.exportState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.exportDemo.mainBrowserStore.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.exportDemo.mainBrowserStore.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.exportDemo.mainBrowserStore.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE137_2.md', `# Phase 137.2 - Secure Master Answer Log JSON Export Entry

Baut eine Entry-Seite fuer den lokalen JSON-Export der Haupt-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-export-entry.ts
- API: /api/cmt/master/secure/main/log/list/export-json/entry
- UI: /cmt/master/secure/main/log/list/export-json/entry
- Patch: scripts/p137-2.cjs
- Verify: scripts/v137-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list/export-json/status
- /cmt/master/secure/main/log/list/export-json/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/main-browser-store/status
- /cmt/master/secure

Status:

- JSON-Export-Entry sichtbar
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

write('scripts/v137-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', "phase: '137.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'jsonExportEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'downloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/entry/route.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/entry/page.tsx', 'Export State'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE137_2.md', 'Secure Master Answer Log JSON Export Entry'],
  ['package.json', 'phase137:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.2 Secure Master Answer Log JSON Export Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase137:2:verify'] = 'node scripts/v137-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 137.2 Secure Master Answer Log JSON Export Entry patch applied.');
