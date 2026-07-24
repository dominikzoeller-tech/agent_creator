const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'getSecureMasterAnswerLogListFilterOptionsDemo'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', "phaseOptions: '132.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'routes: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'intents: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'privacyDecisions: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/route.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/page.tsx', 'Dropdown-Optionen lokal ableiten'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/page.tsx', 'Options State'],
  ['README_PHASE132_0.md', 'Secure Master Local Answer Log List Filter Options'],
  ['package.json', 'phase132:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.0 Secure Master Local Answer Log List Filter Options verification OK.');
