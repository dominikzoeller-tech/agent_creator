const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee-status.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/lib/cmt-master-committee-status.ts', "phase: '125.1'"],
  ['frontend/lib/cmt-master-committee-status.ts', "mainCommitteePage: '/cmt/master/secure/committee'"],
  ['frontend/lib/cmt-master-committee-status.ts', 'integratedInSecureMaster: true'],
  ['frontend/lib/cmt-master-committee-status.ts', 'fiveRolesVisible: true'],
  ['frontend/lib/cmt-master-committee-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/committee/status/route.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/app/cmt/master/secure/committee/status/page.tsx', 'Committee State'],
  ['frontend/app/cmt/master/secure/committee/status/page.tsx', 'Rollen'],
  ['README_PHASE125_1.md', 'Secure Master Committee Status'],
  ['package.json', 'phase125:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.1 Secure Master Committee Status verification OK.');
