const fs = require('fs');
const checks = [
  ['README_PHASE106_2.md', 'Phase 106.2'],
  ['frontend/app/p106-2-dash/page.tsx', 'Phase 106.2 Dashboard'],
  ['frontend/app/p106-2-dash/page.tsx', 'getP1061Audit'],
  ['package.json', 'phase106:2:verify'],
  ['package.json', 'phase106:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 106.2 verification OK.');
