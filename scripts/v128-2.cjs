const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-entry.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/lib/cmt-master-main-view-entry.ts', "phase: '128.2'"],
  ['frontend/lib/cmt-master-main-view-entry.ts', "primaryMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'statusBadgesVisible: true'],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/view/entry/route.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/app/cmt/master/secure/main/view/entry/page.tsx', 'Visible Features'],
  ['frontend/app/cmt/master/secure/main/view/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE128_2.md', 'Secure Master Structured Main View Entry'],
  ['package.json', 'phase128:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.2 Secure Master Structured Main View Entry verification OK.');
