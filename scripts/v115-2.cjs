const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingGuide'],
  ['frontend/lib/cmt-land-guide.ts', "phase: '115.2'"],
  ['frontend/lib/cmt-land-guide.ts', "label: 'Gremium Landing Guide'"],
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/guide/route.ts', 'getCommitteeLandingGuide'],
  ['frontend/app/cmt/land/guide/page.tsx', 'Phase 115.2'],
  ['frontend/app/cmt/land/guide/page.tsx', 'Demo Ablauf'],
  ['README_PHASE115_2.md', 'Gremium Landing Guide'],
  ['package.json', 'phase115:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.2 Gremium Landing Guide verification OK.');
