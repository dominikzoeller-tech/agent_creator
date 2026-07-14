const fs = require('fs');
const checks = [
  ['README_PHASE108_3.md', 'Phase 108.3 Final Handoff'],
  ['README_PHASE108_3.md', 'provider = none'],
  ['README_PHASE108_3.md', 'modelSelected = none'],
  ['README_PHASE108_3.md', 'dryRunOnly = true'],
  ['README_PHASE108_3.md', 'finalDispatchBlocked = true'],
  ['README_PHASE108_3.md', 'networkCallAllowed = false'],
  ['README_PHASE108_3.md', 'providerDispatchAllowed = false'],
  ['package.json', 'phase108:3:verify'],
  ['package.json', 'llm:p108:final:check']
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file, fragment);
}
console.log('Phase 108.3 verification OK.');
