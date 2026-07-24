const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', "phase: '130.1'"],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', "listPage: '/cmt/master/secure/main/log/list'"],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'inMemoryListVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'multipleLogsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/status/route.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/status/page.tsx', 'List State'],
  ['README_PHASE130_1.md', 'Secure Master In-Memory Answer Log List Status'],
  ['package.json', 'phase130:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.1 Secure Master In-Memory Answer Log List Status verification OK.');
