const fs = require('fs');
const checks = [
  ['README_PHASE137_3.md', 'Phase 137.3'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export Status'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export Entry'],
  ['README_PHASE137_3.md', '/cmt/master/secure/main/log/list/export-json'],
  ['README_PHASE137_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/export-json'],
  ['README_PHASE137_3.md', 'exportPrepared = true'],
  ['README_PHASE137_3.md', 'exportButtonVisible = true'],
  ['README_PHASE137_3.md', 'jsonPayloadPrepared = true'],
  ['README_PHASE137_3.md', 'downloadPrepared = true'],
  ['README_PHASE137_3.md', 'importPreparedLater = true'],
  ['README_PHASE137_3.md', 'includesLogs = true'],
  ['README_PHASE137_3.md', 'includesFilters = true'],
  ['README_PHASE137_3.md', 'includesPersistenceState = true'],
  ['README_PHASE137_3.md', 'includesSafetyState = true'],
  ['README_PHASE137_3.md', 'persistedOnServer = false'],
  ['README_PHASE137_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE137_3.md', 'Phase 138.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['package.json', 'phase137:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.3 Secure Master Answer Log JSON Export Handoff verification OK.');
