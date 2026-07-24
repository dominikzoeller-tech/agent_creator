const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', "phase: '139.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/status/route.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/status/page.tsx', 'Apply Status'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/status/page.tsx', 'Demo Apply Payload Preview'],
  ['README_PHASE139_1.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Status'],
  ['package.json', 'phase139:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.1 Secure Master Answer Log JSON Import Manual Browser Apply Status verification OK.');
