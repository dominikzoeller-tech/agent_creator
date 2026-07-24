const fs = require('fs');
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
