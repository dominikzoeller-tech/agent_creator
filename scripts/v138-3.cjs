const fs = require('fs');
const checks = [
  ['README_PHASE138_3.md', 'Phase 138.3'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Preparation'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Status'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Entry'],
  ['README_PHASE138_3.md', '/cmt/master/secure/main/log/list/import-json'],
  ['README_PHASE138_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/import-json'],
  ['README_PHASE138_3.md', 'importPrepared = true'],
  ['README_PHASE138_3.md', 'importUiVisible = true'],
  ['README_PHASE138_3.md', 'schemaCheckPrepared = true'],
  ['README_PHASE138_3.md', 'importPreviewPrepared = true'],
  ['README_PHASE138_3.md', 'validationPrepared = true'],
  ['README_PHASE138_3.md', 'applyImportAutomatically = false'],
  ['README_PHASE138_3.md', 'manualApplyRequiredLater = true'],
  ['README_PHASE138_3.md', 'browserStorePreserved = true'],
  ['README_PHASE138_3.md', 'persistedOnServer = false'],
  ['README_PHASE138_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE138_3.md', 'Phase 139.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['package.json', 'phase138:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.3 Secure Master Answer Log JSON Import Handoff verification OK.');
