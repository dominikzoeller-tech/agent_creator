const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-secure-status.ts', 'getSecureMasterStatus'],
  ['frontend/lib/cmt-master-secure-status.ts', "phase: '122.1'"],
  ['frontend/lib/cmt-master-secure-status.ts', "currentMode: 'secure-master-local-testable'"],
  ['frontend/lib/cmt-master-secure-status.ts', 'privacyGateIntegrated: true'],
  ['frontend/lib/cmt-master-secure-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/status/route.ts', 'getSecureMasterStatus'],
  ['frontend/app/cmt/master/secure/status/page.tsx', 'Phase 122.1'],
  ['frontend/app/cmt/master/secure/status/page.tsx', 'Capabilities'],
  ['README_PHASE122_1.md', 'Secure Master Agent Status'],
  ['package.json', 'phase122:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.1 Secure Master Agent Status verification OK.');
