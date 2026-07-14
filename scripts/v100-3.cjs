const fs = require('fs');
const checks = [
  ['README_PHASE100_3.md', 'Phase 100.3 Final Handoff'],
  ['scripts/f100-3.cjs', 'Phase 100.3 final check OK'],
  ['package.json', 'phase100:3:verify'],
  ['package.json', 'llm:p100:final:check'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 100.3 verification OK.');
