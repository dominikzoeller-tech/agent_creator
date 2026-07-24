const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', "phase: '134.0'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/route.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'Haupt-Logliste lokal filtern'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'mainLogListSelectIntegrated'],
  ['README_PHASE134_0.md', 'Secure Master Main Log List Select Integration'],
  ['package.json', 'phase134:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.0 Secure Master Main Log List Select Integration verification OK.');
