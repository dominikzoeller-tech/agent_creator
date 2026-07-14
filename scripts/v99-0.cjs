const fs = require('fs');
const checks = [
  ['README_PHASE99_0.md', 'Phase 99.0'],
  ['frontend/lib/p99-0-store.ts', "phase: '99.0'"],
  ['frontend/lib/p99-0-store.ts', "priorBoundaryPhase: '98.0'"],
  ['frontend/lib/p99-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p99-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p99-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p99-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p99-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p99-0/route.ts', 'getP990Receipt'],
  ['frontend/app/p99-0/page.tsx', 'Phase 99.0'],
  ['package.json', 'phase99:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 99.0 verification OK.');
