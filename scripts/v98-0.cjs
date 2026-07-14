const fs = require('fs');
const checks = [
  ['README_PHASE98_0.md', 'Phase 98.0'],
  ['frontend/lib/p98-0-store.ts', "phase: '98.0'"],
  ['frontend/lib/p98-0-store.ts', "priorReceiptPhase: '97.0'"],
  ['frontend/lib/p98-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p98-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p98-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p98-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p98-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p98-0/route.ts', 'getP980Boundary'],
  ['frontend/app/p98-0/page.tsx', 'Phase 98.0'],
  ['package.json', 'phase98:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 98.0 verification OK.');
