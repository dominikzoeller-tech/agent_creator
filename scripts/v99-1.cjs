const fs = require('fs');
const checks = [
  ['README_PHASE99_1.md', 'Phase 99.1'],
  ['frontend/lib/p99-1-store.ts', "phase: '99.1'"],
  ['frontend/lib/p99-1-store.ts', "receiptPhase: '99.0'"],
  ['frontend/lib/p99-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p99-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p99-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p99-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p99-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p99-1/route.ts', 'getP991Audit'],
  ['frontend/app/p99-1/page.tsx', 'Phase 99.1'],
  ['package.json', 'phase99:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 99.1 verification OK.');
