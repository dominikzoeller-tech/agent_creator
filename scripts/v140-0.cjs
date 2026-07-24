const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'loadSecureMasterAnswerLogManualApplyFromBrowser'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', "phase: '140.0'"],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'mainLogListManualApplyBrowserLoadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'readsManualApplyPayloadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'manualApplySourceRecognized: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'sourceLabelVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'loadButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'browserReadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/route.ts', 'loadSecureMasterAnswerLogManualApplyFromBrowser'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/page.tsx', 'Manual-Apply-Payload aus Browser laden'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/page.tsx', 'Source Preview'],
  ['README_PHASE140_0.md', 'Secure Master Main Log List Manual JSON Apply Browser Load'],
  ['package.json', 'phase140:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 140.0 Secure Master Main Log List Manual JSON Apply Browser Load verification OK.');
