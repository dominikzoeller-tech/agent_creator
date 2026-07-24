const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-status.ts', "phase: '115.1'"],
  ['frontend/lib/cmt-land-status.ts', "label: 'Gremium Landing Status'"],
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/status/route.ts', 'getCommitteeLandingStatus'],
  ['frontend/app/cmt/land/status/page.tsx', 'Phase 115.1'],
  ['frontend/app/cmt/land/status/page.tsx', 'Zur Landing Page'],
  ['README_PHASE115_1.md', 'Gremium Landing Status'],
  ['package.json', 'phase115:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.1 Gremium Landing Status verification OK.');
