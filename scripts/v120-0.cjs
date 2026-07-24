const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master.ts', 'askMasterAgentLocal'],
  ['frontend/lib/cmt-master.ts', 'getMasterAgentDemo'],
  ['frontend/lib/cmt-master.ts', "phase: '120.0'"],
  ['frontend/lib/cmt-master.ts', "label: 'Master Agent Router MVP'"],
  ['frontend/lib/cmt-master.ts', "route: 'privacy_gate'"],
  ['frontend/lib/cmt-master.ts', "route: 'committee'"],
  ['frontend/lib/cmt-master.ts', "route: 'direct'"],
  ['frontend/lib/cmt-master.ts', "usableStatus: 'master-router-local-testable'"],
  ['frontend/lib/cmt-master.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-master.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/master/route.ts', 'askMasterAgentLocal'],
  ['frontend/app/cmt/master/page.tsx', 'Master-Agent fragen'],
  ['frontend/app/cmt/master/page.tsx', 'Routing Entscheidung'],
  ['README_PHASE120_0.md', 'Master Agent Router MVP'],
  ['package.json', 'phase120:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.0 Master Agent Router MVP verification OK.');
