const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', "phase: '138.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/route.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/page.tsx', 'Import Preview vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/page.tsx', 'Validation'],
  ['README_PHASE138_0.md', 'Secure Master Answer Log JSON Import Preparation'],
  ['package.json', 'phase138:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.0 Secure Master Answer Log JSON Import Preparation verification OK.');
