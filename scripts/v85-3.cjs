const fs = require('fs');
const checks = [
  ['README_PHASE85_3.md', 'Phase 85.3'],
  ['README_PHASE85_3.md', '/p85-0'],
  ['README_PHASE85_3.md', '/api/p85-0'],
  ['README_PHASE85_3.md', '/p85-1'],
  ['README_PHASE85_3.md', '/api/p85-1'],
  ['README_PHASE85_3.md', '/p85-2-dash'],
  ['README_PHASE85_3.md', 'provider=none'],
  ['README_PHASE85_3.md', 'modelSelected=none'],
  ['README_PHASE85_3.md', 'dryRunOnly=true'],
  ['README_PHASE85_3.md', 'networkCallAllowed=false'],
  ['scripts/f85-3.cjs', 'Phase 85 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 85.3 verification OK.');
