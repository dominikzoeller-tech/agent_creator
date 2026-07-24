const fs = require('fs');
const checks = [
  ['README_PHASE129_3.md', 'Phase 129.3'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log Status'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log Entry'],
  ['README_PHASE129_3.md', '/cmt/master/secure/main/log'],
  ['README_PHASE129_3.md', 'http://localhost:3001/cmt/master/secure/main/log'],
  ['README_PHASE129_3.md', 'persistedInBrowser = false'],
  ['README_PHASE129_3.md', 'persistedOnServer = false'],
  ['README_PHASE129_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE129_3.md', 'Phase 130.0'],
  ['frontend/lib/cmt-master-answer-log.ts', 'createSecureMasterAnswerLog'],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'getSecureMasterAnswerLogStatus'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'getSecureMasterAnswerLogEntry'],
  ['package.json', 'phase129:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.3 Secure Master Local Answer Log Handoff verification OK.');
