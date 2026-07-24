const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', "phase: '133.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'selectEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'usesPhase132Options: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/entry/route.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/entry/page.tsx', 'UI-Checklist'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE133_2.md', 'Secure Master Local Answer Log List Filter Select Entry'],
  ['package.json', 'phase133:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.2 Secure Master Local Answer Log List Filter Select Entry verification OK.');
