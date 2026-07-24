const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'getSecureMasterAnswerLogMainBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', "phase: '136.1'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'mainLogListBrowserStoreIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'saveButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'loadOnRefreshPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'resetButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', "persistedInBrowser: 'browser_optional_local'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'serverStoragePrepared: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/main-browser-store/status/route.ts', 'getSecureMasterAnswerLogMainBrowserStoreStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/main-browser-store/status/page.tsx', 'Integration State'],
  ['frontend/app/cmt/master/secure/main/log/list/main-browser-store/status/page.tsx', 'Demo Counts'],
  ['README_PHASE136_1.md', 'Secure Master Main Log List Browser Store Status'],
  ['package.json', 'phase136:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 136.1 Secure Master Main Log List Browser Store Status verification OK.');
