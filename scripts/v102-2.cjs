const fs = require('fs');
const checks = [
  ['README_PHASE102_2.md', 'Phase 102.2'],
  ['frontend/app/p102-2-dash/page.tsx', 'Phase 102.2 Dashboard'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p102-2-dash/page.tsx', 'audit.providerDispatchAllowed'],
  ['scripts/s102-2.cjs', '/p102-2-dash'],
  ['scripts/s102-2.cjs', '/p102-1'],
  ['scripts/s102-2.cjs', '/api/p102-1'],
  ['package.json', 'phase102:2:verify'],
  ['package.json', 'phase102:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 102.2 verification OK.');
