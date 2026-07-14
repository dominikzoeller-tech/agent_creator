const fs = require('fs');
const checks = [
  ['README_PHASE83_2.md', 'Phase 83.2'],
  ['frontend/app/p83-2-dash/page.tsx', 'Phase 83.2 Dashboard'],
  ['frontend/app/p83-2-dash/page.tsx', "provider: 'none'"],
  ['frontend/app/p83-2-dash/page.tsx', "modelSelected: 'none'"],
  ['frontend/app/p83-2-dash/page.tsx', 'dryRunOnly: true'],
  ['frontend/app/p83-2-dash/page.tsx', 'finalDispatchBlocked: true'],
  ['frontend/app/p83-2-dash/page.tsx', 'executionGateClosed: true'],
  ['frontend/app/p83-2-dash/page.tsx', 'networkCallAllowed: false'],
  ['frontend/app/p83-2-dash/page.tsx', 'providerDispatchAllowed: false'],
  ['scripts/s83-2.cjs', '/p83-2-dash'],
  ['package.json', 'phase83:2:verify'],
  ['package.json', 'phase83:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 83.2 verification OK.');
