const fs = require('fs');
const checks = [
  ['README_PHASE82_2.md', 'Phase 82.2'],
  ['frontend/app/p82-2-dash/page.tsx', 'Phase 82.2 Dashboard'],
  ['frontend/app/p82-2-dash/page.tsx', "provider: 'none'"],
  ['frontend/app/p82-2-dash/page.tsx', "modelSelected: 'none'"],
  ['frontend/app/p82-2-dash/page.tsx', 'dryRunOnly: true'],
  ['frontend/app/p82-2-dash/page.tsx', 'finalDispatchBlocked: true'],
  ['frontend/app/p82-2-dash/page.tsx', 'executionGateClosed: true'],
  ['frontend/app/p82-2-dash/page.tsx', 'networkCallAllowed: false'],
  ['frontend/app/p82-2-dash/page.tsx', 'providerDispatchAllowed: false'],
  ['scripts/s82-2.cjs', '/p82-2-dash'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 82.2 verification OK.');
