const fs = require('fs');
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
