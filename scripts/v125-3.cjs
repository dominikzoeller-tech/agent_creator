const fs = require('fs');
const checks = [
  ['README_PHASE125_3.md', 'Phase 125.3'],
  ['README_PHASE125_3.md', 'Secure Master Committee Integration'],
  ['README_PHASE125_3.md', 'Secure Master Committee Status'],
  ['README_PHASE125_3.md', 'Secure Master Committee Entry'],
  ['README_PHASE125_3.md', '/cmt/master/secure/committee'],
  ['README_PHASE125_3.md', 'http://localhost:3001/cmt/master/secure/committee'],
  ['README_PHASE125_3.md', '5er-Gremium ist sichtbar integriert'],
  ['README_PHASE125_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE125_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE125_3.md', 'Phase 126.0'],
  ['frontend/lib/cmt-master-committee.ts', 'askSecureMasterCommittee'],
  ['frontend/lib/cmt-master-committee-status.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/lib/cmt-master-committee-entry.ts', 'getSecureMasterCommitteeEntry'],
  ['package.json', 'phase125:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.3 Secure Master Committee Handoff verification OK.');
