const fs = require('fs');
const checks = [
  ['README_PHASE88_3.md', 'Phase 88.3'],
  ['README_PHASE88_3.md', '/p88-0'],
  ['README_PHASE88_3.md', '/api/p88-0'],
  ['README_PHASE88_3.md', '/p88-1'],
  ['README_PHASE88_3.md', '/api/p88-1'],
  ['README_PHASE88_3.md', '/p88-2-dash'],
  ['README_PHASE88_3.md', 'provider=none'],
  ['README_PHASE88_3.md', 'modelSelected=none'],
  ['README_PHASE88_3.md', 'dryRunOnly=true'],
  ['README_PHASE88_3.md', 'networkCallAllowed=false'],
  ['scripts/f88-3.cjs', 'Phase 88 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 88.3 verification OK.');
