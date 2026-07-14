const fs = require('fs');
const checks = [
  ['README_PHASE90_3.md', 'Phase 90.3'],
  ['README_PHASE90_3.md', '/p90-0'],
  ['README_PHASE90_3.md', '/api/p90-0'],
  ['README_PHASE90_3.md', '/p90-1'],
  ['README_PHASE90_3.md', '/api/p90-1'],
  ['README_PHASE90_3.md', '/p90-2-dash'],
  ['README_PHASE90_3.md', 'provider=none'],
  ['README_PHASE90_3.md', 'modelSelected=none'],
  ['README_PHASE90_3.md', 'dryRunOnly=true'],
  ['README_PHASE90_3.md', 'networkCallAllowed=false'],
  ['scripts/f90-3.cjs', 'Phase 90 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 90.3 verification OK.');
