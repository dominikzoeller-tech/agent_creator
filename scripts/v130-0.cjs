const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'getSecureMasterAnswerLogListDemo'],
  ['frontend/lib/cmt-master-answer-log-list.ts', "phaseList: '130.0'"],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/route.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'In-Memory-Logliste erzeugen'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'List State'],
  ['README_PHASE130_0.md', 'Secure Master In-Memory Answer Log List'],
  ['package.json', 'phase130:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.0 Secure Master In-Memory Answer Log List verification OK.');
