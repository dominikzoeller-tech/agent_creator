const fs = require('fs');
const checks = [
  ['README_PHASE95_0.md', 'Phase 95.0'],
  ['frontend/lib/p95-0-store.ts', "phase: '95.0'"],
  ['frontend/lib/p95-0-store.ts', "priorBoundaryPhase: '94.0'"],
  ['frontend/lib/p95-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p95-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p95-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p95-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p95-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p95-0/route.ts', 'getP950Receipt'],
  ['frontend/app/p95-0/page.tsx', 'Phase 95.0'],
  ['package.json', 'phase95:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 95.0 verification OK.');
