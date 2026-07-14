const fs = require('fs');
const checks = [
  ['README_PHASE88_2.md', 'Phase 88.2'],
  ['frontend/app/p88-2-dash/page.tsx', 'Phase 88.2 Dashboard'],
  ['frontend/app/p88-2-dash/page.tsx', "provider: 'none'"],
  ['frontend/app/p88-2-dash/page.tsx', "modelSelected: 'none'"],
  ['frontend/app/p88-2-dash/page.tsx', 'dryRunOnly: true'],
  ['frontend/app/p88-2-dash/page.tsx', 'finalDispatchBlocked: true'],
  ['frontend/app/p88-2-dash/page.tsx', 'executionGateClosed: true'],
  ['frontend/app/p88-2-dash/page.tsx', 'networkCallAllowed: false'],
  ['frontend/app/p88-2-dash/page.tsx', 'providerDispatchAllowed: false'],
  ['scripts/s88-2.cjs', '/p88-2-dash'],
  ['package.json', 'phase88:2:verify'],
  ['package.json', 'phase88:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 88.2 verification OK.');
