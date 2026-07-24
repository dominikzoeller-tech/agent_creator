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

write('frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', `import { getSecureMasterAnswerLogBrowserStoreStatus, type SecureMasterAnswerLogBrowserStoreStatus } from './cmt-master-answer-log-list-browser-store-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogBrowserStoreEntry = {
  phase: '135.2';
  label: 'Secure Master Browser Log Store Entry';
  status: SecureMasterAnswerLogBrowserStoreStatus;
  primaryBrowserStorePage: '/cmt/master/secure/main/log/list/browser-store';
  browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  secureMasterPage: '/cmt/master/secure';
  browserStoreApi: '/api/cmt/master/secure/main/log/list/browser-store';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  persistence: {
    browserStoreEntryVisible: true;
    localStoragePrepared: true;
    storageKeyVisible: true;
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
  nextMilestone: string;
};

export function getSecureMasterAnswerLogBrowserStoreEntry(): SecureMasterAnswerLogBrowserStoreEntry {
  return {
    phase: '135.2',
    label: 'Secure Master Browser Log Store Entry',
    status: getSecureMasterAnswerLogBrowserStoreStatus(),
    primaryBrowserStorePage: '/cmt/master/secure/main/log/list/browser-store',
    browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    secureMasterPage: '/cmt/master/secure',
    browserStoreApi: '/api/cmt/master/secure/main/log/list/browser-store',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'Browser-Store-Seite als Kontrollseite fuer localStorage-Vorbereitung nutzen.',
      'Haupt-Logliste bleibt der bevorzugte Loglisten-Testpunkt.',
      'Speichern in Browser nur lokal und optional testen.',
      'Laden aus Browser nach Reload pruefen.',
      'Browser-Speicher loeschen/Reset testen.',
      'Statusseite zur Kontrolle der Persistenz-Flags verwenden.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Browser-Store-Entry sichtbar.',
      'Browser-Store-Seite verlinkt.',
      'Browser-Store-Status verlinkt.',
      'Haupt-Logliste verlinkt.',
      'localStorage-Key sichtbar.',
      'canSaveInBrowser = true sichtbar.',
      'canLoadFromBrowser = true sichtbar.',
      'canClearBrowserLogs = true sichtbar.',
      'persistedInBrowser = prepared_not_auto_enabled sichtbar.',
      'persistedOnServer = false sichtbar.',
      'serverStoragePrepared = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    persistence: {
      browserStoreEntryVisible: true,
      localStoragePrepared: true,
      storageKeyVisible: true,
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
    nextMilestone: 'Phase 135.3: Secure Master Browser Log Store Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/browser-store/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogBrowserStoreEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-browser-store-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogBrowserStoreEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/browser-store/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogBrowserStoreEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store-entry';

export default function SecureMasterAnswerLogBrowserStoreEntryPage() {
  const entry = getSecureMasterAnswerLogBrowserStoreEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Browser-Store-Entry ist sichtbar. Browserseitige Speicherung ist vorbereitet, aber nicht serverseitig aktiv.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryBrowserStorePage}>Browser-Store-Seite</Link></li>
          <li><Link href={entry.browserStoreStatusPage}>Browser-Store-Status</Link></li>
          <li><Link href={entry.mainLogListPage}>Haupt-Logliste</Link></li>
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
        <h3>Persistence State</h3>
        <ul>{Object.entries(entry.persistence).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE135_2.md', `# Phase 135.2 - Secure Master Browser Log Store Entry

Baut eine Entry-Seite fuer die vorbereitete browserseitige Logspeicherung.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts
- API: /api/cmt/master/secure/main/log/list/browser-store/entry
- UI: /cmt/master/secure/main/log/list/browser-store/entry
- Patch: scripts/p135-2.cjs
- Verify: scripts/v135-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/browser-store
- /cmt/master/secure/main/log/list/browser-store/status
- /cmt/master/secure/main/log/list/browser-store/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- Browser-Store-Entry sichtbar
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

write('scripts/v135-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'getSecureMasterAnswerLogBrowserStoreEntry'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', "phase: '135.2'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'browserStoreEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'localStoragePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'canSaveInBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'canLoadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'canClearBrowserLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'resetPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'exportPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', "persistedInBrowser: 'prepared_not_auto_enabled'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'serverStoragePrepared: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/browser-store/entry/route.ts', 'getSecureMasterAnswerLogBrowserStoreEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/entry/page.tsx', 'Persistence State'],
  ['README_PHASE135_2.md', 'Secure Master Browser Log Store Entry'],
  ['package.json', 'phase135:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.2 Secure Master Browser Log Store Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase135:2:verify'] = 'node scripts/v135-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 135.2 Secure Master Browser Log Store Entry patch applied.');
