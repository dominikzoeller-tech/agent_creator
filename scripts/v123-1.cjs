const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-nav-status.ts', 'getSecureMasterNavStatus'],
  ['frontend/lib/cmt-master-nav-status.ts', "phase: '123.1'"],
  ['frontend/lib/cmt-master-nav-status.ts', "primaryEntry: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-nav-status.ts', "recommendedDefaultPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-nav-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/nav/status/route.ts', 'getSecureMasterNavStatus'],
  ['frontend/app/cmt/master/nav/status/page.tsx', 'Navigation State'],
  ['frontend/app/cmt/master/nav/status/page.tsx', 'Route Map'],
  ['README_PHASE123_1.md', 'Secure Master Navigation Status'],
  ['package.json', 'phase123:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.1 Secure Master Navigation Status verification OK.');
