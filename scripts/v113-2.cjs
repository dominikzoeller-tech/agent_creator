const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-sum.ts', 'createCommitteeSessionSummary'],
  ['frontend/lib/cmt-sum.ts', 'getCommitteeSessionSummaryDemo'],
  ['frontend/lib/cmt-sum.ts', "phase: '113.2'"],
  ['frontend/lib/cmt-sum.ts', "label: 'Gremium Summary'"],
  ['frontend/lib/cmt-sum.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-sum.ts', "provider: 'none'"],
  ['frontend/lib/cmt-sum.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-sum.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/sum/route.ts', 'createCommitteeSessionSummary'],
  ['frontend/app/cmt/sum/page.tsx', 'Phase 113.2'],
  ['README_PHASE113_2.md', 'Gremium Summary'],
  ['package.json', 'phase113:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113.2 Gremium Summary verification OK.');
