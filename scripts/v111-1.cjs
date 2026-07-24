const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-result.ts', 'createCommitteeDecisionResult'],
  ['frontend/lib/cmt-result.ts', 'getCommitteeDecisionResultDemo'],
  ['frontend/lib/cmt-result.ts', "phase: '111.1'"],
  ['frontend/lib/cmt-result.ts', "label: 'Gremium Ergebnis'"],
  ['frontend/lib/cmt-result.ts', 'verdict'],
  ['frontend/lib/cmt-result.ts', 'nextActions'],
  ['frontend/lib/cmt-result.ts', "provider: 'none'"],
  ['frontend/lib/cmt-result.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-result.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-result.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-result.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-result.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/result/route.ts', 'createCommitteeDecisionResult'],
  ['frontend/app/cmt/result/page.tsx', 'Phase 111.1'],
  ['README_PHASE111_1.md', 'Gremium Ergebnis'],
  ['package.json', 'phase111:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 111.1 Gremium Ergebnis verification OK.');
