const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', "phase: '139.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'jsonImportManualApplyEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/entry/route.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/entry/page.tsx', 'Apply State'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/entry/page.tsx', 'Demo Apply Payload Preview'],
  ['README_PHASE139_2.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Entry'],
  ['package.json', 'phase139:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.2 Secure Master Answer Log JSON Import Manual Browser Apply Entry verification OK.');
