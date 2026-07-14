const fs = require('fs');
const checks = [
  ['README_PHASE84_3.md', 'Phase 84.3'],
  ['README_PHASE84_3.md', '/p84-0'],
  ['README_PHASE84_3.md', '/api/p84-0'],
  ['README_PHASE84_3.md', '/p84-1'],
  ['README_PHASE84_3.md', '/api/p84-1'],
  ['README_PHASE84_3.md', '/p84-2-dash'],
  ['README_PHASE84_3.md', 'provider=none'],
  ['README_PHASE84_3.md', 'modelSelected=none'],
  ['README_PHASE84_3.md', 'dryRunOnly=true'],
  ['README_PHASE84_3.md', 'networkCallAllowed=false'],
  ['scripts/f84-3.cjs', 'Phase 84 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 84.3 verification OK.');
