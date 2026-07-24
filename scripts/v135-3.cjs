const fs = require('fs');
const checks = [
  ['README_PHASE135_3.md', 'Phase 135.3'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Preparation'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Status'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Entry'],
  ['README_PHASE135_3.md', '/cmt/master/secure/main/log/list/browser-store'],
  ['README_PHASE135_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/browser-store'],
  ['README_PHASE135_3.md', 'localStorage-Key sichtbar'],
  ['README_PHASE135_3.md', 'canSaveInBrowser = true'],
  ['README_PHASE135_3.md', 'canLoadFromBrowser = true'],
  ['README_PHASE135_3.md', 'canClearBrowserLogs = true'],
  ['README_PHASE135_3.md', 'persistedInBrowser = prepared_not_auto_enabled'],
  ['README_PHASE135_3.md', 'persistedOnServer = false'],
  ['README_PHASE135_3.md', 'serverStoragePrepared = false'],
  ['README_PHASE135_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE135_3.md', 'Phase 136.0'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'getSecureMasterAnswerLogBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'getSecureMasterAnswerLogBrowserStoreEntry'],
  ['package.json', 'phase135:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.3 Secure Master Browser Log Store Handoff verification OK.');
