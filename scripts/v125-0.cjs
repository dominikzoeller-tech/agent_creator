const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee.ts', 'askSecureMasterCommittee'],
  ['frontend/lib/cmt-master-committee.ts', 'getSecureMasterCommitteeDemo'],
  ['frontend/lib/cmt-master-committee.ts', "phaseCommittee: '125.0'"],
  ['frontend/lib/cmt-master-committee.ts', 'Visionär'],
  ['frontend/lib/cmt-master-committee.ts', 'Skeptiker'],
  ['frontend/lib/cmt-master-committee.ts', 'Umsetzer'],
  ['frontend/lib/cmt-master-committee.ts', 'Datenschutz & Risiko'],
  ['frontend/lib/cmt-master-committee.ts', 'Wirtschaftlichkeit & Praxisnutzen'],
  ['frontend/app/api/cmt/master/secure/committee/route.ts', 'askSecureMasterCommittee'],
  ['frontend/app/cmt/master/secure/committee/page.tsx', 'Secure Master + Gremium testen'],
  ['frontend/app/cmt/master/secure/committee/page.tsx', '5 Rollen'],
  ['README_PHASE125_0.md', 'Secure Master Committee Integration'],
  ['package.json', 'phase125:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.0 Secure Master Committee Integration verification OK.');
