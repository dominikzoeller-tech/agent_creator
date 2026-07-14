const fs = require('fs');
const checks = [
  ['README_PHASE94_3.md', 'Phase 94.3'],
  ['README_PHASE94_3.md', '/p94-0'],
  ['README_PHASE94_3.md', '/api/p94-0'],
  ['README_PHASE94_3.md', '/p94-1'],
  ['README_PHASE94_3.md', '/api/p94-1'],
  ['README_PHASE94_3.md', '/p94-2-dash'],
  ['README_PHASE94_3.md', 'provider=none'],
  ['README_PHASE94_3.md', 'modelSelected=none'],
  ['README_PHASE94_3.md', 'dryRunOnly=true'],
  ['README_PHASE94_3.md', 'networkCallAllowed=false'],
  ['scripts/f94-3.cjs', 'Phase 94 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 94.3 verification OK.');
