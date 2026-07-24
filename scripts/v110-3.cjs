const fs = require('fs');

const checks = [
  ['README_PHASE110_3.md', 'Phase 110.3'],
  ['README_PHASE110_3.md', 'Gremium Core'],
  ['README_PHASE110_3.md', 'Question Intake'],
  ['README_PHASE110_3.md', 'Gremium Deliberation'],
  ['README_PHASE110_3.md', 'provider = none'],
  ['README_PHASE110_3.md', 'dryRunOnly = true'],
  ['README_PHASE110_3.md', 'networkCallAllowed = false'],
  ['README_PHASE110_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE110_3.md', 'Phase 111.0'],
  ['frontend/lib/cmt-store.ts', 'getCommitteeCore'],
  ['frontend/lib/cmt-intake.ts', 'createCommitteeQuestion'],
  ['frontend/lib/cmt-delib.ts', 'createCommitteeDeliberation'],
  ['package.json', 'phase110:3:verify'],
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
console.log('Phase 110.3 Handoff verification OK.');
