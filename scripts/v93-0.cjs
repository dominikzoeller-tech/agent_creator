const fs = require('fs');
const checks = [
  ['README_PHASE93_0.md', 'Phase 93.0'],
  ['frontend/lib/p93-0-store.ts', "phase: '93.0'"],
  ['frontend/lib/p93-0-store.ts', "priorBoundaryPhase: '92.0'"],
  ['frontend/lib/p93-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p93-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p93-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p93-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p93-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p93-0/route.ts', 'getP930Receipt'],
  ['frontend/app/p93-0/page.tsx', 'Phase 93.0'],
  ['package.json', 'phase93:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 93.0 verification OK.');
