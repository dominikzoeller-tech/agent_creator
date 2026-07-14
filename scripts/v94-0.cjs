const fs = require('fs');
const checks = [
  ['README_PHASE94_0.md', 'Phase 94.0'],
  ['frontend/lib/p94-0-store.ts', "phase: '94.0'"],
  ['frontend/lib/p94-0-store.ts', "priorReceiptPhase: '93.0'"],
  ['frontend/lib/p94-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p94-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p94-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p94-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p94-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p94-0/route.ts', 'getP940Boundary'],
  ['frontend/app/p94-0/page.tsx', 'Phase 94.0'],
  ['package.json', 'phase94:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 94.0 verification OK.');
