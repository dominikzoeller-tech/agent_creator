const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', "phase: '138.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/status/route.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/status/page.tsx', 'Import Status'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/status/page.tsx', 'Demo Validation'],
  ['README_PHASE138_1.md', 'Secure Master Answer Log JSON Import Status'],
  ['package.json', 'phase138:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.1 Secure Master Answer Log JSON Import Status verification OK.');
