const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-model.ts', 'askSecureMasterMainView'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'getSecureMasterMainViewDemo'],
  ['frontend/lib/cmt-master-main-view-model.ts', "phaseView: '128.0'"],
  ['frontend/lib/cmt-master-main-view-model.ts', 'badges'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'compactBlocks'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'roleCards'],
  ['frontend/app/api/cmt/master/secure/main/view/route.ts', 'askSecureMasterMainView'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Structured Main View'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Status-Badges'],
  ['frontend/app/cmt/master/secure/page.tsx', '5er-Gremium'],
  ['README_PHASE128_0.md', 'Secure Master Structured Main View'],
  ['package.json', 'phase128:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.0 Secure Master Structured Main View verification OK.');
