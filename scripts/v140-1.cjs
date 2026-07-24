const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'getSecureMasterAnswerLogManualApplyBrowserLoadStatus'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', "phase: '140.1'"],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'mainLogListManualApplyBrowserLoadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'readsManualApplyPayloadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'manualApplySourceRecognized: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'sourceLabelVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'loadButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'browserReadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'sourcePreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/status/route.ts', 'getSecureMasterAnswerLogManualApplyBrowserLoadStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/status/page.tsx', 'Load Status'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/status/page.tsx', 'Demo Source Preview'],
  ['README_PHASE140_1.md', 'Secure Master Main Log List Manual Apply Browser Load Status'],
  ['package.json', 'phase140:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 140.1 Secure Master Main Log List Manual Apply Browser Load Status verification OK.');
