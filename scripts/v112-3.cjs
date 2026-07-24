const fs = require('fs');

const checks = [
  ['README_PHASE112_3.md', 'Phase 112.3'],
  ['README_PHASE112_3.md', 'Gremium Ask UI'],
  ['README_PHASE112_3.md', 'Gremium Run'],
  ['README_PHASE112_3.md', 'Gremium View'],
  ['README_PHASE112_3.md', 'provider = none'],
  ['README_PHASE112_3.md', 'dryRunOnly = true'],
  ['README_PHASE112_3.md', 'networkCallAllowed = false'],
  ['README_PHASE112_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE112_3.md', 'Phase 113.0'],
  ['frontend/lib/cmt-ask.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-run.ts', 'createCommitteeRun'],
  ['frontend/lib/cmt-view.ts', 'createCommitteeView'],
  ['package.json', 'phase112:3:verify'],
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
console.log('Phase 112.3 Handoff verification OK.');
