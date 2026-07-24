const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', "phase: '132.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', "optionsPage: '/cmt/master/secure/main/log/list/filter/options'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'routeOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'intentOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'privacyOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'allOptionPrepended: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/status/route.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/status/page.tsx', 'Options State'],
  ['README_PHASE132_1.md', 'Secure Master Local Answer Log List Filter Options Status'],
  ['package.json', 'phase132:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.1 Secure Master Local Answer Log List Filter Options Status verification OK.');
