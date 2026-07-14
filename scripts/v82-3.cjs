const fs = require('fs');
const checks = [
  ['README_PHASE82_3.md', 'Phase 82.3'],
  ['README_PHASE82_3.md', '/p82-2-dash'],
  ['README_PHASE82_3.md', '/p82-1'],
  ['README_PHASE82_3.md', '/api/p82-1'],
  ['README_PHASE82_3.md', 'provider=none'],
  ['README_PHASE82_3.md', 'modelSelected=none'],
  ['README_PHASE82_3.md', 'dryRunOnly=true'],
  ['README_PHASE82_3.md', 'networkCallAllowed=false'],
  ['scripts/f82-3.cjs', 'Phase 82 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 82.3 verification OK.');
