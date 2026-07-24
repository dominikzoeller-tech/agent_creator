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

write('frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', `import { getSecureMasterAnswerLogMainBrowserStoreStatus, type SecureMasterAnswerLogMainBrowserStoreStatus } from './cmt-master-answer-log-list-main-browser-store-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogMainBrowserStoreEntry = {
  phase: '136.2';
  label: 'Secure Master Main Log List Browser Store Entry';
  status: SecureMasterAnswerLogMainBrowserStoreStatus;
  primaryMainLogListPage: '/cmt/master/secure/main/log/list';
  mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status';
  browserStoreControlPage: '/cmt/master/secure/main/log/list/browser-store';
  browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status';
  browserStoreEntryPage: '/cmt/master/secure/main/log/list/browser-store/entry';
  secureMasterPage: '/cmt/master/secure';
  mainBrowserStoreApi: '/api/cmt/master/secure/main/log/list/main-browser-store';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  integration: {
    mainBrowserStoreEntryVisible: true;
    mainLogListBrowserStoreIntegrated: true;
    saveButtonVisible: true;
    loadOnRefreshPrepared: true;
    resetButtonVisible: true;
    localStorageKeyVisible: true;
    controlPagesPreserved: true;
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

export function getSecureMasterAnswerLogMainBrowserStoreEntry(): SecureMasterAnswerLogMainBrowserStoreEntry {
  return {
    phase: '136.2',
    label: 'Secure Master Main Log List Browser Store Entry',
    status: getSecureMasterAnswerLogMainBrowserStoreStatus(),
    primaryMainLogListPage: '/cmt/master/secure/main/log/list',
    mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status',
    browserStoreControlPage: '/cmt/master/secure/main/log/list/browser-store',
    browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status',
    browserStoreEntryPage: '/cmt/master/secure/main/log/list/browser-store/entry',
    secureMasterPage: '/cmt/master/secure',
    mainBrowserStoreApi: '/api/cmt/master/secure/main/log/list/main-browser-store',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'Haupt-Logliste als Standardseite fuer lokale Answer-Logs nutzen.',
      'Direkt in der Haupt-Logliste speichern, laden und resetten testen.',
      'Nach Reload pruefen, ob localStorage-Werte wieder geladen werden.',
      'Statusseite zur Kontrolle der Main-Browser-Store-Flags nutzen.',
      'Browser-Store-Kontrollseiten fuer gezielte Persistenztests behalten.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Main-Browser-Store-Entry sichtbar.',
      'Haupt-Logliste verlinkt.',
      'Main-Browser-Store-Status verlinkt.',
      'Browser-Store-Kontrollseite verlinkt.',
      'Browser-Store-Status verlinkt.',
      'Browser-Store-Entry verlinkt.',
      'localStorage-Key sichtbar.',
      'saveButtonVisible = true sichtbar.',
      'loadOnRefreshPrepared = true sichtbar.',
      'resetButtonVisible = true sichtbar.',
      'persistedInBrowser = browser_optional_local sichtbar.',
      'persistedOnServer = false sichtbar.',
      'serverStoragePrepared = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    integration: {
      mainBrowserStoreEntryVisible: true,
      mainLogListBrowserStoreIntegrated: true,
      saveButtonVisible: true,
      loadOnRefreshPrepared: true,
      resetButtonVisible: true,
      localStorageKeyVisible: true,
      controlPagesPreserved: true,
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
    nextMilestone: 'Phase 136.3: Secure Master Main Log List Browser Store Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/main-browser-store/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogMainBrowserStoreEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogMainBrowserStoreEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/main-browser-store/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogMainBrowserStoreEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store-entry';

export default function SecureMasterAnswerLogMainBrowserStoreEntryPage() {
  const entry = getSecureMasterAnswerLogMainBrowserStoreEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 136.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Main-Browser-Store-Entry ist sichtbar. Die Haupt-Logliste ist die bevorzugte Seite fuer Speichern, Laden und Reset.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.mainBrowserStoreStatusPage}>Main-Browser-Store-Status</Link></li>
          <li><Link href={entry.browserStoreControlPage}>Browser-Store-Kontrollseite</Link></li>
          <li><Link href={entry.browserStoreStatusPage}>Browser-Store-Status</Link></li>
          <li><Link href={entry.browserStoreEntryPage}>Browser-Store-Entry</Link></li>
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
        <h3>Integration State</h3>
        <ul>{Object.entries(entry.integration).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.mainBrowserStore.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.mainBrowserStore.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE136_2.md', `# Phase 136.2 - Secure Master Main Log List Browser Store Entry

Baut eine Entry-Seite fuer die in die Haupt-Logliste integrierte browserseitige Speicherung.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts
- API: /api/cmt/master/secure/main/log/list/main-browser-store/entry
- UI: /cmt/master/secure/main/log/list/main-browser-store/entry
- Patch: scripts/p136-2.cjs
- Verify: scripts/v136-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/main-browser-store/status
- /cmt/master/secure/main/log/list/main-browser-store/entry
- /cmt/master/secure/main/log/list/browser-store
- /cmt/master/secure/main/log/list/browser-store/status
- /cmt/master/secure/main/log/list/browser-store/entry
- /cmt/master/secure

Status:

- Main-Browser-Store-Entry sichtbar
- mainLogListBrowserStoreIntegrated = true
- saveButtonVisible = true
- loadOnRefreshPrepared = true
- resetButtonVisible = true
- localStorageKeyVisible = true
- controlPagesPreserved = true
- persistedInBrowser = browser_optional_local
- persistedOnServer = false
- serverStoragePrepared = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v136-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'getSecureMasterAnswerLogMainBrowserStoreEntry'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', "phase: '136.2'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'mainBrowserStoreEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'mainLogListBrowserStoreIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'saveButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'loadOnRefreshPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'resetButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', "persistedInBrowser: 'browser_optional_local'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'serverStoragePrepared: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/main-browser-store/entry/route.ts', 'getSecureMasterAnswerLogMainBrowserStoreEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/main-browser-store/entry/page.tsx', 'Integration State'],
  ['frontend/app/cmt/master/secure/main/log/list/main-browser-store/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE136_2.md', 'Secure Master Main Log List Browser Store Entry'],
  ['package.json', 'phase136:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 136.2 Secure Master Main Log List Browser Store Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase136:2:verify'] = 'node scripts/v136-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 136.2 Secure Master Main Log List Browser Store Entry patch applied.');
