const fs = require('fs');
const checks = [
  ['README_PHASE91_3.md', 'Phase 91.3'],
  ['README_PHASE91_3.md', '/p91-0'],
  ['README_PHASE91_3.md', '/api/p91-0'],
  ['README_PHASE91_3.md', '/p91-1'],
  ['README_PHASE91_3.md', '/api/p91-1'],
  ['README_PHASE91_3.md', '/p91-2-dash'],
  ['README_PHASE91_3.md', 'provider=none'],
  ['README_PHASE91_3.md', 'modelSelected=none'],
  ['README_PHASE91_3.md', 'dryRunOnly=true'],
  ['README_PHASE91_3.md', 'networkCallAllowed=false'],
  ['scripts/f91-3.cjs', 'Phase 91 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 91.3 verification OK.');
