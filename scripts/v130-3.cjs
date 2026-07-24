const fs = require('fs');
const checks = [
  ['README_PHASE130_3.md', 'Phase 130.3'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List Status'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List Entry'],
  ['README_PHASE130_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE130_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE130_3.md', 'persistedInBrowser = false'],
  ['README_PHASE130_3.md', 'persistedOnServer = false'],
  ['README_PHASE130_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE130_3.md', 'Phase 131.0'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'getSecureMasterAnswerLogListEntry'],
  ['package.json', 'phase130:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.3 Secure Master In-Memory Answer Log List Handoff verification OK.');
