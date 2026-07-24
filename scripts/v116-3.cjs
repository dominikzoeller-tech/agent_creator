const fs = require('fs');

const checks = [
  ['README_PHASE116_3.md', 'Phase 116.3'],
  ['README_PHASE116_3.md', 'Gremium Main Navigation'],
  ['README_PHASE116_3.md', 'Gremium Home Entry'],
  ['README_PHASE116_3.md', 'Gremium App Entry'],
  ['README_PHASE116_3.md', 'provider = none'],
  ['README_PHASE116_3.md', 'dryRunOnly = true'],
  ['README_PHASE116_3.md', 'networkCallAllowed = false'],
  ['README_PHASE116_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE116_3.md', 'Phase 117.0'],
  ['frontend/lib/cmt-nav.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-home.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeAppEntry'],
  ['package.json', 'phase116:3:verify'],
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
console.log('Phase 116.3 Handoff verification OK.');
