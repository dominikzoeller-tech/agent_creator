const fs = require('fs');
const checks = [
  ['README_PHASE103_2.md', 'Phase 103.2'],
  ['frontend/app/p103-2-dash/page.tsx', 'Phase 103.2 Dashboard'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p103-2-dash/page.tsx', 'audit.providerDispatchAllowed'],
  ['scripts/s103-2.cjs', 'http://localhost:3000/p103-2-dash'],
  ['scripts/s103-2.cjs', 'http://localhost:3000/p103-1'],
  ['scripts/s103-2.cjs', 'http://localhost:3000/api/p103-1'],
  ['package.json', 'phase103:2:verify'],
  ['package.json', 'phase103:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 103.2 verification OK.');
