const fs = require('fs');
const checks = [
  ['README_PHASE139_3.md', 'Phase 139.3'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Status'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Entry'],
  ['README_PHASE139_3.md', '/cmt/master/secure/main/log/list/import-json/apply'],
  ['README_PHASE139_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/import-json/apply'],
  ['README_PHASE139_3.md', 'manualApplyPrepared = true'],
  ['README_PHASE139_3.md', 'applyButtonVisible = true'],
  ['README_PHASE139_3.md', 'applyRequiresValidSchema = true'],
  ['README_PHASE139_3.md', 'applyRequiresParseOk = true'],
  ['README_PHASE139_3.md', 'applyImportAutomatically = false'],
  ['README_PHASE139_3.md', 'previewVisibleBeforeApply = true'],
  ['README_PHASE139_3.md', 'validationVisibleBeforeApply = true'],
  ['README_PHASE139_3.md', 'localStorageWritePrepared = true'],
  ['README_PHASE139_3.md', 'persistedOnServer = false'],
  ['README_PHASE139_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE139_3.md', 'Phase 140.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['package.json', 'phase139:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.3 Secure Master Answer Log JSON Import Manual Browser Apply Handoff verification OK.');
