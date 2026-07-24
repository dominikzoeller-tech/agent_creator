const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'getSecureMasterAnswerLogListFilterDemo'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', "phaseFilter: '131.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/route.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/page.tsx', 'Logliste lokal filtern'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/page.tsx', 'Filter State'],
  ['README_PHASE131_0.md', 'Secure Master Local Answer Log List Filter'],
  ['package.json', 'phase131:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.0 Secure Master Local Answer Log List Filter verification OK.');
