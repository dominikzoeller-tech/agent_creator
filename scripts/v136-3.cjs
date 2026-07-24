const fs = require('fs');
const checks = [
  ['README_PHASE136_3.md', 'Phase 136.3'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Integration'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Status'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Entry'],
  ['README_PHASE136_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE136_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE136_3.md', 'mainLogListBrowserStoreIntegrated = true'],
  ['README_PHASE136_3.md', 'saveButtonVisible = true'],
  ['README_PHASE136_3.md', 'loadOnRefreshPrepared = true'],
  ['README_PHASE136_3.md', 'resetButtonVisible = true'],
  ['README_PHASE136_3.md', 'persistedInBrowser = browser_optional_local'],
  ['README_PHASE136_3.md', 'persistedOnServer = false'],
  ['README_PHASE136_3.md', 'serverStoragePrepared = false'],
  ['README_PHASE136_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE136_3.md', 'Phase 137.0'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'createSecureMasterAnswerLogMainBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'getSecureMasterAnswerLogMainBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'getSecureMasterAnswerLogMainBrowserStoreEntry'],
  ['package.json', 'phase136:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 136.3 Secure Master Main Log List Browser Store Handoff verification OK.');
