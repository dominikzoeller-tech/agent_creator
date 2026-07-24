const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', "phase: '139.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/route.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/page.tsx', 'Apply Preview vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/page.tsx', 'Validiertes JSON manuell in Browser speichern'],
  ['README_PHASE139_0.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation'],
  ['package.json', 'phase139:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.0 Secure Master Answer Log JSON Import Manual Browser Apply Preparation verification OK.');
