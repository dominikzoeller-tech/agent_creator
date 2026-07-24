const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-land.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land.ts', "phase: '115.0'"],
  ['frontend/lib/cmt-land.ts', "label: 'Gremium MVP Landing'"],
  ['frontend/lib/cmt-land.ts', 'getCommitteeMvpDemo'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeDemoReport'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeDemoShare'],
  ['frontend/lib/cmt-land.ts', "provider: 'none'"],
  ['frontend/lib/cmt-land.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-land.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/land/route.ts', 'getCommitteeLanding'],
  ['frontend/app/cmt/land/page.tsx', 'Phase 115.0'],
  ['frontend/app/cmt/land/page.tsx', 'Demo starten'],
  ['README_PHASE115_0.md', 'Gremium MVP Landing'],
  ['package.json', 'phase115:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 115.0 Gremium MVP Landing verification OK.');
