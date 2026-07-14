const fs = require('fs');
const checks = [
  ['README_PHASE95_1.md', 'Phase 95.1'],
  ['frontend/lib/p95-1-store.ts', "phase: '95.1'"],
  ['frontend/lib/p95-1-store.ts', "receiptPhase: '95.0'"],
  ['frontend/lib/p95-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p95-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p95-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p95-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p95-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p95-1/route.ts', 'getP951Audit'],
  ['frontend/app/p95-1/page.tsx', 'Phase 95.1'],
  ['package.json', 'phase95:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 95.1 verification OK.');
