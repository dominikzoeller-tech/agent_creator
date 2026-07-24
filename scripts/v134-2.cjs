const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', "phase: '134.2'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'mainLogListEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/entry/route.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/select/entry/page.tsx', 'UI-Checklist'],
  ['frontend/app/cmt/master/secure/main/log/list/select/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE134_2.md', 'Secure Master Main Log List Select Entry'],
  ['package.json', 'phase134:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.2 Secure Master Main Log List Select Entry verification OK.');
