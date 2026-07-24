const fs = require('fs');
const checks = [
  ['README_PHASE128_3.md', 'Phase 128.3'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View Status'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View Entry'],
  ['README_PHASE128_3.md', '/cmt/master/secure'],
  ['README_PHASE128_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE128_3.md', 'Status-Badges'],
  ['README_PHASE128_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE128_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE128_3.md', 'Phase 129.0'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'askSecureMasterMainView'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Structured Main View'],
  ['package.json', 'phase128:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.3 Secure Master Structured Main View Handoff verification OK.');
