const fs = require('fs');
const checks = [
  ['README_PHASE98_3.md', 'Phase 98.3 Final Handoff'],
  ['scripts/f98-3.cjs', 'Phase 98.3 final check OK'],
  ['package.json', 'phase98:3:verify'],
  ['package.json', 'llm:p98:final:check'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 98.3 verification OK.');
