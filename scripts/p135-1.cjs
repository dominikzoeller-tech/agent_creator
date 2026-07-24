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

write('frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', `import { getSecureMasterAnswerLogBrowserStoreDemo, type SecureMasterAnswerLogBrowserStoreResult, SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogBrowserStoreStatus = {
  phase: '135.1';
  label: 'Secure Master Browser Log Store Status';
  browserStore: SecureMasterAnswerLogBrowserStoreResult;
  pages: {
    browserStorePage: '/cmt/master/secure/main/log/list/browser-store';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    selectStatusPage: '/cmt/master/secure/main/log/list/select/status';
    secureMasterPage: '/cmt/master/secure';
  };
  localStorage: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    prepared: true;
    localStorageKeyVisible: true;
    canSaveInBrowser: true;
    canLoadFromBrowser: true;
    canClearBrowserLogs: true;
    resetPrepared: true;
    exportPreparedLater: true;
    persistedInBrowser: 'prepared_not_auto_enabled';
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
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogBrowserStoreStatus(): SecureMasterAnswerLogBrowserStoreStatus {
  return {
    phase: '135.1',
    label: 'Secure Master Browser Log Store Status',
    browserStore: getSecureMasterAnswerLogBrowserStoreDemo(),
    pages: {
      browserStorePage: '/cmt/master/secure/main/log/list/browser-store',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      selectStatusPage: '/cmt/master/secure/main/log/list/select/status',
      secureMasterPage: '/cmt/master/secure',
    },
    localStorage: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      prepared: true,
      localStorageKeyVisible: true,
      canSaveInBrowser: true,
      canLoadFromBrowser: true,
      canClearBrowserLogs: true,
      resetPrepared: true,
      exportPreparedLater: true,
      persistedInBrowser: 'prepared_not_auto_enabled',
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
    checks: [
      'Browser-Store-Seite ist erreichbar.',
      'localStorage-Key ist sichtbar.',
      'Speichern in Browser ist vorbereitet.',
      'Laden aus Browser ist vorbereitet.',
      'Loeschen/Reset ist vorbereitet.',
      'Export ist fuer spaeter vorbereitet.',
      'persistedInBrowser = prepared_not_auto_enabled.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 135.2: Secure Master Browser Log Store Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/browser-store/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogBrowserStoreStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-browser-store-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogBrowserStoreStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/browser-store/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogBrowserStoreStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store-status';

export default function SecureMasterAnswerLogBrowserStoreStatusPage() {
  const data = getSecureMasterAnswerLogBrowserStoreStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Browserseitige Logspeicherung ist vorbereitet. Server-Persistenz bleibt aus.</p>
        <p><strong>Storage Key:</strong> {data.localStorage.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.browserStorePage}>Browser-Store-Seite</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.selectStatusPage}>Main-Loglist-Select-Status</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>localStorage Status</h3>
        <ul>{Object.entries(data.localStorage).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(data.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {data.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {data.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {data.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {data.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {data.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
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

write('README_PHASE135_1.md', `# Phase 135.1 - Secure Master Browser Log Store Status

Baut eine Statusseite fuer die vorbereitete browserseitige Logspeicherung.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-browser-store-status.ts
- API: /api/cmt/master/secure/main/log/list/browser-store/status
- UI: /cmt/master/secure/main/log/list/browser-store/status
- Patch: scripts/p135-1.cjs
- Verify: scripts/v135-1.cjs

Status:

- Browser-Store-Status sichtbar
- localStorage-Key sichtbar
- canSaveInBrowser = true
- canLoadFromBrowser = true
- canClearBrowserLogs = true
- resetPrepared = true
- exportPreparedLater = true
- persistedInBrowser = prepared_not_auto_enabled
- persistedOnServer = false
- serverStoragePrepared = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v135-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'getSecureMasterAnswerLogBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', "phase: '135.1'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'canSaveInBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'canLoadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'canClearBrowserLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'resetPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'exportPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', "persistedInBrowser: 'prepared_not_auto_enabled'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'serverStoragePrepared: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/browser-store/status/route.ts', 'getSecureMasterAnswerLogBrowserStoreStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/status/page.tsx', 'localStorage Status'],
  ['README_PHASE135_1.md', 'Secure Master Browser Log Store Status'],
  ['package.json', 'phase135:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.1 Secure Master Browser Log Store Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase135:1:verify'] = 'node scripts/v135-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 135.1 Secure Master Browser Log Store Status patch applied.');
