const fs = require('fs');
const checks = [
  ['README_PHASE97_3.md', 'Phase 97.3 Final Handoff'],
  ['scripts/f97-3.cjs', 'Phase 97.3 final check OK'],
  ['package.json', 'phase97:3:verify'],
  ['package.json', 'llm:p97:final:check'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 97.3 verification OK.');
