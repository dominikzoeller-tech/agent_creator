const fs = require('fs');
const checks = [
  ['README_PHASE105_0.md', 'Phase 105.0'],
  ['frontend/lib/p105-0-store.ts', "phase: '105.0'"],
  ['frontend/lib/p105-0-store.ts', "priorBoundaryPhase: '104.0'"],
  ['frontend/lib/p105-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p105-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p105-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p105-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p105-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p105-0-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/app/api/p105-0/route.ts', 'getP1050Boundary'],
  ['frontend/app/p105-0/page.tsx', 'Phase 105.0'],
  ['package.json', 'phase105:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 105.0 verification OK.');
