const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-status.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/lib/cmt-master-main-view-status.ts', "phase: '128.1'"],
  ['frontend/lib/cmt-master-main-view-status.ts', "mainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-view-status.ts', 'statusBadgesVisible: true'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'compactBlocksVisible: true'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/view/status/route.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/app/cmt/master/secure/main/view/status/page.tsx', 'View State'],
  ['frontend/app/cmt/master/secure/main/view/status/page.tsx', 'Sichtbare Badges'],
  ['README_PHASE128_1.md', 'Secure Master Structured Main View Status'],
  ['package.json', 'phase128:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.1 Secure Master Structured Main View Status verification OK.');
