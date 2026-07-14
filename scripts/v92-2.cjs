const fs = require('fs');
const checks = [
  ['README_PHASE92_2.md', 'Phase 92.2'],
  ['frontend/app/p92-2-dash/page.tsx', 'Phase 92.2 Dashboard'],
  ['frontend/app/p92-2-dash/page.tsx', "provider: 'none'"],
  ['frontend/app/p92-2-dash/page.tsx', "modelSelected: 'none'"],
  ['frontend/app/p92-2-dash/page.tsx', 'dryRunOnly: true'],
  ['frontend/app/p92-2-dash/page.tsx', 'finalDispatchBlocked: true'],
  ['frontend/app/p92-2-dash/page.tsx', 'executionGateClosed: true'],
  ['frontend/app/p92-2-dash/page.tsx', 'networkCallAllowed: false'],
  ['frontend/app/p92-2-dash/page.tsx', 'providerDispatchAllowed: false'],
  ['scripts/s92-2.cjs', '/p92-2-dash'],
  ['package.json', 'phase92:2:verify'],
  ['package.json', 'phase92:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 92.2 verification OK.');
