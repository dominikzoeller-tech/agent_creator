const fs = require('fs');
const checks = [
  ['README_PHASE107_2.md', 'Phase 107.2'],
  ['frontend/app/p107-2-dash/page.tsx', 'Phase 107.2 Dashboard'],
  ['frontend/app/p107-2-dash/page.tsx', 'getP1071Audit'],
  ['scripts/s107-2.cjs', '/p107-2-dash'],
  ['scripts/s107-2.cjs', '/p107-1'],
  ['scripts/s107-2.cjs', '/api/p107-1'],
  ['package.json', 'phase107:2:verify'],
  ['package.json', 'phase107:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 107.2 verification OK.');
