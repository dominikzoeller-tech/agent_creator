const fs = require('fs');
const checks = [
  ['README_PHASE95_3.md', 'Phase 95.3'],
  ['README_PHASE95_3.md', '/p95-0'],
  ['README_PHASE95_3.md', '/api/p95-0'],
  ['README_PHASE95_3.md', '/p95-1'],
  ['README_PHASE95_3.md', '/api/p95-1'],
  ['README_PHASE95_3.md', '/p95-2-dash'],
  ['README_PHASE95_3.md', 'provider=none'],
  ['README_PHASE95_3.md', 'modelSelected=none'],
  ['README_PHASE95_3.md', 'dryRunOnly=true'],
  ['README_PHASE95_3.md', 'networkCallAllowed=false'],
  ['scripts/f95-3.cjs', 'Phase 95 final check OK'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 95.3 verification OK.');
