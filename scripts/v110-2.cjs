const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-delib.ts', 'createCommitteeDeliberation'],
  ['frontend/lib/cmt-delib.ts', 'getCommitteeDeliberationDemo'],
  ['frontend/lib/cmt-delib.ts', "phase: '110.2'"],
  ['frontend/lib/cmt-delib.ts', "label: 'Gremium Deliberation'"],
  ['frontend/lib/cmt-delib.ts', 'CommitteeOpinion'],
  ['frontend/lib/cmt-delib.ts', 'recommendation'],
  ['frontend/lib/cmt-delib.ts', "provider: 'none'"],
  ['frontend/lib/cmt-delib.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-delib.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-delib.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-delib.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-delib.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/delib/route.ts', 'createCommitteeDeliberation'],
  ['frontend/app/cmt/delib/page.tsx', 'Phase 110.2'],
  ['README_PHASE110_2.md', 'Gremium Deliberation'],
  ['package.json', 'phase110:2:verify'],
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
console.log('Phase 110.2 Gremium Deliberation verification OK.');
