const fs = require('fs');

const checks = [
  ['README_PHASE118_3.md', 'Phase 118.3'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Plan'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Status'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Guide'],
  ['README_PHASE118_3.md', 'provider = none'],
  ['README_PHASE118_3.md', 'dryRunOnly = true'],
  ['README_PHASE118_3.md', 'networkCallAllowed = false'],
  ['README_PHASE118_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE118_3.md', 'externalStorageEnabled = false'],
  ['README_PHASE118_3.md', 'actualFileWriteEnabled = false'],
  ['README_PHASE118_3.md', 'Phase 119.0'],
  ['frontend/lib/cmt-json.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonGuide'],
  ['package.json', 'phase118:3:verify'],
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
console.log('Phase 118.3 Handoff verification OK.');
