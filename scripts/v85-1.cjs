const fs = require('fs');
const checks = [
  ['README_PHASE85_1.md', 'Phase 85.1'],
  ['frontend/lib/p85-1-store.ts', "phase: '85.1'"],
  ['frontend/lib/p85-1-store.ts', "receiptPhase: '85.0'"],
  ['frontend/lib/p85-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p85-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p85-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p85-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p85-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p85-1/route.ts', 'getP851Audit'],
  ['frontend/app/p85-1/page.tsx', 'Phase 85.1'],
  ['package.json', 'phase85:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 85.1 verification OK.');
