const fs = require('fs');
const checks = [
  ['README_PHASE100_3.md', 'Phase 100.3 Final Handoff'],
  ['README_PHASE100_3.md', '/p100-0'],
  ['README_PHASE100_3.md', '/p100-1'],
  ['README_PHASE100_3.md', '/p100-2-dash'],
  ['README_PHASE100_3.md', 'provider=none'],
  ['README_PHASE100_3.md', 'modelSelected=none'],
  ['README_PHASE100_3.md', 'dryRunOnly=true'],
  ['README_PHASE100_3.md', 'networkCallAllowed=false'],
  ['README_PHASE100_3.md', 'providerDispatchAllowed=false'],
  ['README_PHASE100_3.md', 'Phase 101.0'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 100.3 final check OK.');
