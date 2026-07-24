const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log.ts', 'createSecureMasterAnswerLog'],
  ['frontend/lib/cmt-master-answer-log.ts', 'getSecureMasterAnswerLogDemo'],
  ['frontend/lib/cmt-master-answer-log.ts', "phaseLog: '129.0'"],
  ['frontend/lib/cmt-master-answer-log.ts', 'badgeSummary'],
  ['frontend/lib/cmt-master-answer-log.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/route.ts', 'createSecureMasterAnswerLog'],
  ['frontend/app/cmt/master/secure/main/log/page.tsx', 'Lokales Antwortprotokoll erzeugen'],
  ['frontend/app/cmt/master/secure/main/log/page.tsx', 'Persistence'],
  ['README_PHASE129_0.md', 'Secure Master Local Answer Log'],
  ['package.json', 'phase129:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.0 Secure Master Local Answer Log verification OK.');
