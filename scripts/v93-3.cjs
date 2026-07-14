const fs = require('fs');
const checks = [
  ['README_PHASE93_3.md', 'Phase 93.3'],
  ['README_PHASE93_3.md', '/p93-0'],
  ['README_PHASE93_3.md', '/api/p93-0'],
  ['README_PHASE93_3.md', '/p93-1'],
  ['README_PHASE93_3.md', '/api/p93-1'],
  ['README_PHASE93_3.md', '/p93-2-dash'],
  ['README_PHASE93_3.md', 'provider=none'],
  ['README_PHASE93_3.md', 'modelSelected=none'],
  ['README_PHASE93_3.md', 'dryRunOnly=true'],
  ['README_PHASE93_3.md', 'networkCallAllowed=false'],
  ['scripts/f93-3.cjs', 'Phase 93 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 93.3 verification OK.');
