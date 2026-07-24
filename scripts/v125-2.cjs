const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee-entry.ts', 'getSecureMasterCommitteeEntry'],
  ['frontend/lib/cmt-master-committee-entry.ts', "phase: '125.2'"],
  ['frontend/lib/cmt-master-committee-entry.ts', "primaryCommitteePage: '/cmt/master/secure/committee'"],
  ['frontend/lib/cmt-master-committee-entry.ts', "committeeStatusPage: '/cmt/master/secure/committee/status'"],
  ['frontend/lib/cmt-master-committee-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/committee/entry/route.ts', 'getSecureMasterCommitteeEntry'],
  ['frontend/app/cmt/master/secure/committee/entry/page.tsx', 'Committee-Testseite'],
  ['frontend/app/cmt/master/secure/committee/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE125_2.md', 'Secure Master Committee Entry'],
  ['package.json', 'phase125:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.2 Secure Master Committee Entry verification OK.');
