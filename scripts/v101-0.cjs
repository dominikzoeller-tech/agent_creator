const fs = require('fs');
const checks = [
  ['README_PHASE101_0.md', 'Phase 101.0'],
  ['frontend/lib/p101-0-store.ts', "phase: '101.0'"],
  ['frontend/lib/p101-0-store.ts', "priorBoundaryPhase: '100.0'"],
  ['frontend/lib/p101-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p101-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p101-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p101-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p101-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p101-0/route.ts', 'getP1010Boundary'],
  ['frontend/app/p101-0/page.tsx', 'Phase 101.0'],
  ['package.json', 'phase101:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 101.0 verification OK.');
