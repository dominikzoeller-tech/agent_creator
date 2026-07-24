const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-secure.ts', 'askSecureMasterAgent'],
  ['frontend/lib/cmt-master-secure.ts', 'getSecureMasterDemo'],
  ['frontend/lib/cmt-master-secure.ts', "phase: '122.0'"],
  ['frontend/lib/cmt-master-secure.ts', "label: 'Secure Master Agent MVP'"],
  ['frontend/lib/cmt-master-secure.ts', "finalRoute = privacy.approval.required"],
  ['frontend/lib/cmt-master-secure.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-master-secure.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/master/secure/route.ts', 'askSecureMasterAgent'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Master-Agent fragen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Privacy Gate'],
  ['README_PHASE122_0.md', 'Secure Master Agent MVP'],
  ['package.json', 'phase122:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.0 Secure Master Agent MVP verification OK.');
