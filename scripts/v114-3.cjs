const fs = require('fs');

const checks = [
  ['README_PHASE114_3.md', 'Phase 114.3'],
  ['README_PHASE114_3.md', 'Gremium MVP Demo'],
  ['README_PHASE114_3.md', 'Gremium Demo Report'],
  ['README_PHASE114_3.md', 'Gremium Demo Share'],
  ['README_PHASE114_3.md', 'provider = none'],
  ['README_PHASE114_3.md', 'dryRunOnly = true'],
  ['README_PHASE114_3.md', 'networkCallAllowed = false'],
  ['README_PHASE114_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE114_3.md', 'Phase 115.0'],
  ['frontend/lib/cmt-demo.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoShare'],
  ['package.json', 'phase114:3:verify'],
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
console.log('Phase 114.3 Handoff verification OK.');
