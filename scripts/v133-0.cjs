const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', "phaseSelect: '133.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/route.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/page.tsx', 'Dropdown-Filter lokal anwenden'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/page.tsx', 'Select Filter State'],
  ['README_PHASE133_0.md', 'Secure Master Local Answer Log List Filter Select'],
  ['package.json', 'phase133:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.0 Secure Master Local Answer Log List Filter Select verification OK.');
