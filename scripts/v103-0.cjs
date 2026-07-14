const fs = require('fs');
const checks = [
  ['README_PHASE103_0.md', 'Phase 103.0'],
  ['frontend/lib/p103-0-store.ts', "phase: '103.0'"],
  ['frontend/lib/p103-0-store.ts', "priorBoundaryPhase: '102.0'"],
  ['frontend/lib/p103-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p103-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p103-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p103-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p103-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p103-0/route.ts', 'getP1030Boundary'],
  ['frontend/app/p103-0/page.tsx', 'Phase 103.0'],
  ['package.json', 'phase103:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 103.0 verification OK.');
