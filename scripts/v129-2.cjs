const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'getSecureMasterAnswerLogEntry'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', "phase: '129.2'"],
  ['frontend/lib/cmt-master-answer-log-entry.ts', "primaryLogPage: '/cmt/master/secure/main/log'"],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'answerLogVisible: true'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/entry/route.ts', 'getSecureMasterAnswerLogEntry'],
  ['frontend/app/cmt/master/secure/main/log/entry/page.tsx', 'Sichtbare Log-Felder'],
  ['frontend/app/cmt/master/secure/main/log/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE129_2.md', 'Secure Master Local Answer Log Entry'],
  ['package.json', 'phase129:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.2 Secure Master Local Answer Log Entry verification OK.');
