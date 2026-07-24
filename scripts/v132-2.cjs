const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', "phase: '132.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', "primaryOptionsPage: '/cmt/master/secure/main/log/list/filter/options'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'routeOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'intentOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'privacyOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'allOptionPrepended: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/entry/route.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/entry/page.tsx', 'Sichtbare Options-Felder'],
  ['README_PHASE132_2.md', 'Secure Master Local Answer Log List Filter Options Entry'],
  ['package.json', 'phase132:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.2 Secure Master Local Answer Log List Filter Options Entry verification OK.');
