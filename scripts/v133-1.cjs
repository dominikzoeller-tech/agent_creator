const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', "phase: '133.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'selectFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'usesPhase132Options: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/status/route.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/status/page.tsx', 'Status Flags'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/status/page.tsx', 'Demo Counts'],
  ['README_PHASE133_1.md', 'Secure Master Local Answer Log List Filter Select Status'],
  ['package.json', 'phase133:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.1 Secure Master Local Answer Log List Filter Select Status verification OK.');
