const fs = require('fs');
const checks = [
  ['README_PHASE96_3.md', 'Phase 96.3'],
  ['README_PHASE96_3.md', '/p96-0'],
  ['README_PHASE96_3.md', '/api/p96-0'],
  ['README_PHASE96_3.md', '/p96-1'],
  ['README_PHASE96_3.md', '/api/p96-1'],
  ['README_PHASE96_3.md', '/p96-2-dash'],
  ['README_PHASE96_3.md', 'provider=none'],
  ['README_PHASE96_3.md', 'modelSelected=none'],
  ['README_PHASE96_3.md', 'dryRunOnly=true'],
  ['README_PHASE96_3.md', 'networkCallAllowed=false'],
  ['scripts/f96-3.cjs', 'Phase 96 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 96.3 verification OK.');
