const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', "phase: '137.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'jsonExportEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'downloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/entry/route.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/entry/page.tsx', 'Export State'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/entry/page.tsx', 'Demo Counts'],
  ['README_PHASE137_2.md', 'Secure Master Answer Log JSON Export Entry'],
  ['package.json', 'phase137:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.2 Secure Master Answer Log JSON Export Entry verification OK.');
