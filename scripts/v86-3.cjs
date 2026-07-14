const fs = require('fs');
const checks = [
  ['README_PHASE86_3.md', 'Phase 86.3'],
  ['README_PHASE86_3.md', '/p86-0'],
  ['README_PHASE86_3.md', '/api/p86-0'],
  ['README_PHASE86_3.md', '/p86-1'],
  ['README_PHASE86_3.md', '/api/p86-1'],
  ['README_PHASE86_3.md', '/p86-2-dash'],
  ['README_PHASE86_3.md', 'provider=none'],
  ['README_PHASE86_3.md', 'modelSelected=none'],
  ['README_PHASE86_3.md', 'dryRunOnly=true'],
  ['README_PHASE86_3.md', 'networkCallAllowed=false'],
  ['scripts/f86-3.cjs', 'Phase 86 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 86.3 verification OK.');
