const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', "phase: '138.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'jsonImportEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/entry/route.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/entry/page.tsx', 'Import State'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/entry/page.tsx', 'Demo Validation'],
  ['README_PHASE138_2.md', 'Secure Master Answer Log JSON Import Entry'],
  ['package.json', 'phase138:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.2 Secure Master Answer Log JSON Import Entry verification OK.');
