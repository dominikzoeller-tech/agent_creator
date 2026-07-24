const fs = require('fs');

const checks = [
  ['README_PHASE117_3.md', 'Phase 117.3'],
  ['README_PHASE117_3.md', 'Gremium Persist Adapter'],
  ['README_PHASE117_3.md', 'Gremium Persist Status'],
  ['README_PHASE117_3.md', 'Gremium Persist Guide'],
  ['README_PHASE117_3.md', 'provider = none'],
  ['README_PHASE117_3.md', 'dryRunOnly = true'],
  ['README_PHASE117_3.md', 'networkCallAllowed = false'],
  ['README_PHASE117_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE117_3.md', 'externalStorageEnabled = false'],
  ['README_PHASE117_3.md', 'Phase 118.0'],
  ['frontend/lib/cmt-persist.ts', 'createCommitteePersistAdapter'],
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistGuide'],
  ['package.json', 'phase117:3:verify'],
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
console.log('Phase 117.3 Handoff verification OK.');
