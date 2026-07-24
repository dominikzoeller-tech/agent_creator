const fs = require('fs');
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
