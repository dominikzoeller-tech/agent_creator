const fs = require('fs');
const checks = [
  ['README_PHASE100_0.md', 'Phase 100.0'],
  ['frontend/lib/p100-0-store.ts', "phase: '100.0'"],
  ['frontend/lib/p100-0-store.ts', "priorReceiptPhase: '99.0'"],
  ['frontend/lib/p100-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p100-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p100-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p100-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p100-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p100-0/route.ts', 'getP1000Boundary'],
  ['frontend/app/p100-0/page.tsx', 'Phase 100.0'],
  ['package.json', 'phase100:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 100.0 verification OK.');
