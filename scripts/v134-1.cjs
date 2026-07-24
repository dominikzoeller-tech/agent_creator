const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', "phase: '134.1'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/status/route.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/select/status/page.tsx', 'Status Flags'],
  ['frontend/app/cmt/master/secure/main/log/list/select/status/page.tsx', 'Demo Counts'],
  ['README_PHASE134_1.md', 'Secure Master Main Log List Select Status'],
  ['package.json', 'phase134:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.1 Secure Master Main Log List Select Status verification OK.');
