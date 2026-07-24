const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-nav.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-nav.ts', "phase: '116.0'"],
  ['frontend/lib/cmt-nav.ts', "label: 'Gremium Main Navigation'"],
  ['frontend/lib/cmt-nav.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-nav.ts', "provider: 'none'"],
  ['frontend/lib/cmt-nav.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-nav.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/nav/route.ts', 'getCommitteeMainNav'],
  ['frontend/app/cmt/nav/page.tsx', 'Phase 116.0'],
  ['frontend/app/cmt/nav/page.tsx', 'MVP-Navigation'],
  ['README_PHASE116_0.md', 'Gremium Main Navigation'],
  ['package.json', 'phase116:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.0 Gremium Main Navigation verification OK.');
