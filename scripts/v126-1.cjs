const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified-status.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/lib/cmt-master-unified-status.ts', "phase: '126.1'"],
  ['frontend/lib/cmt-master-unified-status.ts', "mainUnifiedPage: '/cmt/master/secure/unified'"],
  ['frontend/lib/cmt-master-unified-status.ts', 'privacyGateVisibleWhenNeeded: true'],
  ['frontend/lib/cmt-master-unified-status.ts', 'committeeVisibleWhenNeeded: true'],
  ['frontend/lib/cmt-master-unified-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/unified/status/route.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/app/cmt/master/secure/unified/status/page.tsx', 'Unified State'],
  ['frontend/app/cmt/master/secure/unified/status/page.tsx', 'Sichtbare Blöcke'],
  ['README_PHASE126_1.md', 'Secure Master Unified Status'],
  ['package.json', 'phase126:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.1 Secure Master Unified Status verification OK.');
