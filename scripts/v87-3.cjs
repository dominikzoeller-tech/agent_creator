const fs = require('fs');
const checks = [
  ['README_PHASE87_3.md', 'Phase 87.3'],
  ['README_PHASE87_3.md', '/p87-0'],
  ['README_PHASE87_3.md', '/api/p87-0'],
  ['README_PHASE87_3.md', '/p87-1'],
  ['README_PHASE87_3.md', '/api/p87-1'],
  ['README_PHASE87_3.md', '/p87-2-dash'],
  ['README_PHASE87_3.md', 'provider=none'],
  ['README_PHASE87_3.md', 'modelSelected=none'],
  ['README_PHASE87_3.md', 'dryRunOnly=true'],
  ['README_PHASE87_3.md', 'networkCallAllowed=false'],
  ['scripts/f87-3.cjs', 'Phase 87 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 87.3 verification OK.');
