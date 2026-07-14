const fs = require('fs');
const checks = [
  ['README_PHASE105_2.md', 'Phase 105.2'],
  ['frontend/app/p105-2-dash/page.tsx', 'Phase 105.2 Dashboard'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.providerDispatchAllowed'],
  ['frontend/app/p105-2-dash/page.tsx', 'audit.externalDataTransferAllowed'],
  ['scripts/s105-2.cjs', 'http://localhost:3000/p105-2-dash'],
  ['scripts/s105-2.cjs', 'http://localhost:3000/p105-1'],
  ['scripts/s105-2.cjs', 'http://localhost:3000/api/p105-1'],
  ['package.json', 'phase105:2:verify'],
  ['package.json', 'phase105:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 105.2 verification OK.');
