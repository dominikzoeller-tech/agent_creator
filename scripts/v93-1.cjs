const fs = require('fs');
const checks = [
  ['README_PHASE93_1.md', 'Phase 93.1'],
  ['frontend/lib/p93-1-store.ts', "phase: '93.1'"],
  ['frontend/lib/p93-1-store.ts', "receiptPhase: '93.0'"],
  ['frontend/lib/p93-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p93-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p93-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p93-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p93-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p93-1/route.ts', 'getP931Audit'],
  ['frontend/app/p93-1/page.tsx', 'Phase 93.1'],
  ['package.json', 'phase93:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 93.1 verification OK.');
