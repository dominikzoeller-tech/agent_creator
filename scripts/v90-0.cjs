const fs = require('fs');
const checks = [
  ['README_PHASE90_0.md', 'Phase 90.0'],
  ['frontend/lib/p90-0-store.ts', "phase: '90.0'"],
  ['frontend/lib/p90-0-store.ts', "priorReceiptPhase: '89.0'"],
  ['frontend/lib/p90-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p90-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p90-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p90-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p90-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p90-0/route.ts', 'getP900Boundary'],
  ['frontend/app/p90-0/page.tsx', 'Phase 90.0'],
  ['package.json', 'phase90:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 90.0 verification OK.');
