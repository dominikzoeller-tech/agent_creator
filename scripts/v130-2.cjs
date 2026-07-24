const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'getSecureMasterAnswerLogListEntry'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', "phase: '130.2'"],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', "primaryListPage: '/cmt/master/secure/main/log/list'"],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'inMemoryListVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'multipleLogsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/entry/route.ts', 'getSecureMasterAnswerLogListEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/entry/page.tsx', 'Sichtbare Listen-Felder'],
  ['README_PHASE130_2.md', 'Secure Master In-Memory Answer Log List Entry'],
  ['package.json', 'phase130:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.2 Secure Master In-Memory Answer Log List Entry verification OK.');
