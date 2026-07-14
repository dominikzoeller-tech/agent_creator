const fs = require('fs');
const checks = [
  ['README_PHASE102_0.md', 'Phase 102.0'],
  ['frontend/lib/p102-0-store.ts', "phase: '102.0'"],
  ['frontend/lib/p102-0-store.ts', "priorBoundaryPhase: '101.0'"],
  ['frontend/lib/p102-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p102-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p102-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p102-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p102-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p102-0/route.ts', 'getP1020Boundary'],
  ['frontend/app/p102-0/page.tsx', 'Phase 102.0'],
  ['package.json', 'phase102:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 102.0 verification OK.');
