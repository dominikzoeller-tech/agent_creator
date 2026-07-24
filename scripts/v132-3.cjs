const fs = require('fs');
const checks = [
  ['README_PHASE132_3.md', 'Phase 132.3'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options Status'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options Entry'],
  ['README_PHASE132_3.md', '/cmt/master/secure/main/log/list/filter/options'],
  ['README_PHASE132_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter/options'],
  ['README_PHASE132_3.md', 'routes[0] = all'],
  ['README_PHASE132_3.md', 'persistedInBrowser = false'],
  ['README_PHASE132_3.md', 'persistedOnServer = false'],
  ['README_PHASE132_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE132_3.md', 'Phase 133.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['package.json', 'phase132:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.3 Secure Master Local Answer Log List Filter Options Handoff verification OK.');
