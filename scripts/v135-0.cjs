const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', "phase: '135.0'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canSaveInBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canLoadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canClearBrowserLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', "persistedInBrowser: 'prepared_not_auto_enabled'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/browser-store/route.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/page.tsx', 'In Browser speichern'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/page.tsx', 'Browser-Speicher loeschen'],
  ['README_PHASE135_0.md', 'Secure Master Browser Log Store Preparation'],
  ['package.json', 'phase135:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.0 Secure Master Browser Log Store Preparation verification OK.');
