const fs = require('fs');
const checks = [
  ['README_PHASE88_0.md', 'Phase 88.0'],
  ['frontend/lib/p88-0-store.ts', "phase: '88.0'"],
  ['frontend/lib/p88-0-store.ts', "priorReceiptPhase: '87.0'"],
  ['frontend/lib/p88-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p88-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p88-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p88-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p88-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p88-0/route.ts', 'getP880Boundary'],
  ['frontend/app/p88-0/page.tsx', 'Phase 88.0'],
  ['package.json', 'phase88:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 88.0 verification OK.');
