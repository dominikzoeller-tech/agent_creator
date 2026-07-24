const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', "phase: '137.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'downloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/status/route.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/status/page.tsx', 'Export Status'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/status/page.tsx', 'Demo Payload Counts'],
  ['README_PHASE137_1.md', 'Secure Master Answer Log JSON Export Status'],
  ['package.json', 'phase137:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.1 Secure Master Answer Log JSON Export Status verification OK.');
