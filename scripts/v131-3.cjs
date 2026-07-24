const fs = require('fs');
const checks = [
  ['README_PHASE131_3.md', 'Phase 131.3'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter Status'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter Entry'],
  ['README_PHASE131_3.md', '/cmt/master/secure/main/log/list/filter'],
  ['README_PHASE131_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter'],
  ['README_PHASE131_3.md', 'persistedInBrowser = false'],
  ['README_PHASE131_3.md', 'persistedOnServer = false'],
  ['README_PHASE131_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE131_3.md', 'Phase 132.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['package.json', 'phase131:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.3 Secure Master Local Answer Log List Filter Handoff verification OK.');
