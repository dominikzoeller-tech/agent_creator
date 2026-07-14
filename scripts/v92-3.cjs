const fs = require('fs');
const checks = [
  ['README_PHASE92_3.md', 'Phase 92.3'],
  ['README_PHASE92_3.md', '/p92-0'],
  ['README_PHASE92_3.md', '/api/p92-0'],
  ['README_PHASE92_3.md', '/p92-1'],
  ['README_PHASE92_3.md', '/api/p92-1'],
  ['README_PHASE92_3.md', '/p92-2-dash'],
  ['README_PHASE92_3.md', 'provider=none'],
  ['README_PHASE92_3.md', 'modelSelected=none'],
  ['README_PHASE92_3.md', 'dryRunOnly=true'],
  ['README_PHASE92_3.md', 'networkCallAllowed=false'],
  ['scripts/f92-3.cjs', 'Phase 92 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 92.3 verification OK.');
