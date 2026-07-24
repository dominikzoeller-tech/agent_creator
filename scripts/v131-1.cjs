const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', "phase: '131.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', "filterPage: '/cmt/master/secure/main/log/list/filter'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'localSearchVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'routeFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'intentFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'privacyDecisionFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/status/route.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/status/page.tsx', 'Filter State'],
  ['README_PHASE131_1.md', 'Secure Master Local Answer Log List Filter Status'],
  ['package.json', 'phase131:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.1 Secure Master Local Answer Log List Filter Status verification OK.');
