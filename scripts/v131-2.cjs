const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', "phase: '131.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', "primaryFilterPage: '/cmt/master/secure/main/log/list/filter'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'localSearchVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'routeFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'intentFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'privacyDecisionFilterVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/entry/route.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/entry/page.tsx', 'Sichtbare Filter-Felder'],
  ['README_PHASE131_2.md', 'Secure Master Local Answer Log List Filter Entry'],
  ['package.json', 'phase131:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.2 Secure Master Local Answer Log List Filter Entry verification OK.');
