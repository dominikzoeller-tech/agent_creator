const fs = require('fs');
const checks = [
  ['README_PHASE133_3.md', 'Phase 133.3'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select Status'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select Entry'],
  ['README_PHASE133_3.md', '/cmt/master/secure/main/log/list/filter/select'],
  ['README_PHASE133_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter/select'],
  ['README_PHASE133_3.md', 'Route-Select sichtbar'],
  ['README_PHASE133_3.md', 'Intent-Select sichtbar'],
  ['README_PHASE133_3.md', 'Privacy-Select sichtbar'],
  ['README_PHASE133_3.md', 'persistedInBrowser = false'],
  ['README_PHASE133_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE133_3.md', 'Phase 134.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['package.json', 'phase133:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.3 Secure Master Local Answer Log List Filter Select Handoff verification OK.');
