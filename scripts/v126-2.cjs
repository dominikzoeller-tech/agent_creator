const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified-entry.ts', 'getSecureMasterUnifiedEntry'],
  ['frontend/lib/cmt-master-unified-entry.ts', "phase: '126.2'"],
  ['frontend/lib/cmt-master-unified-entry.ts', "primaryUnifiedPage: '/cmt/master/secure/unified'"],
  ['frontend/lib/cmt-master-unified-entry.ts', "unifiedStatusPage: '/cmt/master/secure/unified/status'"],
  ['frontend/lib/cmt-master-unified-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/unified/entry/route.ts', 'getSecureMasterUnifiedEntry'],
  ['frontend/app/cmt/master/secure/unified/entry/page.tsx', 'Unified-Testseite'],
  ['frontend/app/cmt/master/secure/unified/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE126_2.md', 'Secure Master Unified Entry'],
  ['package.json', 'phase126:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.2 Secure Master Unified Entry verification OK.');
