const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', "phase: '137.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/route.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/page.tsx', 'JSON-Export vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/page.tsx', 'JSON herunterladen'],
  ['README_PHASE137_0.md', 'Secure Master Answer Log JSON Export'],
  ['package.json', 'phase137:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.0 Secure Master Answer Log JSON Export verification OK.');
