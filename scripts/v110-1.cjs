const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-intake.ts', 'createCommitteeQuestion'],
  ['frontend/lib/cmt-intake.ts', 'classifyCommitteeTopic'],
  ['frontend/lib/cmt-intake.ts', 'assessCommitteeRisk'],
  ['frontend/lib/cmt-intake.ts', 'selectCommitteeRoles'],
  ['frontend/lib/cmt-intake.ts', "provider: 'none'"],
  ['frontend/lib/cmt-intake.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-intake.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-intake.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-intake.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-intake.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/intake/route.ts', 'createCommitteeQuestion'],
  ['frontend/app/cmt/intake/page.tsx', 'Phase 110.1'],
  ['README_PHASE110_1.md', 'Question Intake'],
  ['package.json', 'phase110:1:verify'],
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
console.log('Phase 110.1 Question Intake verification OK.');
