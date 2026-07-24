const fs = require('fs');
const checks = [
  ['README_PHASE123_3.md', 'Phase 123.3'],
  ['README_PHASE123_3.md', 'Secure Master Home Entry'],
  ['README_PHASE123_3.md', 'Secure Master Navigation Status'],
  ['README_PHASE123_3.md', 'Secure Master App Entry'],
  ['README_PHASE123_3.md', '/cmt/master/secure'],
  ['README_PHASE123_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE123_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE123_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE123_3.md', 'Phase 124.0'],
  ['frontend/lib/cmt-master-home.ts', 'getSecureMasterHome'],
  ['frontend/lib/cmt-master-nav-status.ts', 'getSecureMasterNavStatus'],
  ['frontend/lib/cmt-master-app-entry.ts', 'getSecureMasterAppEntry'],
  ['package.json', 'phase123:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.3 Secure Master Entry Handoff verification OK.');
