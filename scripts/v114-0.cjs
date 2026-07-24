const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo.ts', 'getCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo.ts', "phase: '114.0'"],
  ['frontend/lib/cmt-demo.ts', "label: 'Gremium MVP Demo'"],
  ['frontend/lib/cmt-demo.ts', 'createCommitteeSessionSummary'],
  ['frontend/lib/cmt-demo.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/route.ts', 'createCommitteeMvpDemo'],
  ['frontend/app/cmt/demo/page.tsx', 'MVP-Demo starten'],
  ['frontend/app/cmt/demo/page.tsx', "fetch('/api/cmt/demo'"],
  ['README_PHASE114_0.md', 'Gremium MVP Demo'],
  ['package.json', 'phase114:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.0 Gremium MVP Demo verification OK.');
