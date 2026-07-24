const fs = require('fs');

const checks = [
  ['README_PHASE115_3.md', 'Phase 115.3'],
  ['README_PHASE115_3.md', 'Gremium MVP Landing'],
  ['README_PHASE115_3.md', 'Gremium Landing Status'],
  ['README_PHASE115_3.md', 'Gremium Landing Guide'],
  ['README_PHASE115_3.md', 'provider = none'],
  ['README_PHASE115_3.md', 'dryRunOnly = true'],
  ['README_PHASE115_3.md', 'networkCallAllowed = false'],
  ['README_PHASE115_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE115_3.md', 'Phase 116.0'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingGuide'],
  ['package.json', 'phase115:3:verify'],
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
console.log('Phase 115.3 Handoff verification OK.');
