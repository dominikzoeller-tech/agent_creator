const fs = require('fs');
const checks = [
  ['README_PHASE85_0.md', 'Phase 85.0'],
  ['frontend/lib/p85-0-store.ts', "phase: '85.0'"],
  ['frontend/lib/p85-0-store.ts', "priorBoundaryPhase: '84.0'"],
  ['frontend/lib/p85-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p85-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p85-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p85-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p85-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p85-0/route.ts', 'getP850Receipt'],
  ['frontend/app/p85-0/page.tsx', 'Phase 85.0'],
  ['package.json', 'phase85:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 85.0 verification OK.');
