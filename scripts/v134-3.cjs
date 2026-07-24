const fs = require('fs');
const checks = [
  ['README_PHASE134_3.md', 'Phase 134.3'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Integration'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Status'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Entry'],
  ['README_PHASE134_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE134_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE134_3.md', 'Route-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'Intent-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'Privacy-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'persistedInBrowser = false'],
  ['README_PHASE134_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE134_3.md', 'Phase 135.0'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['package.json', 'phase134:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.3 Secure Master Main Log List Select Handoff verification OK.');
