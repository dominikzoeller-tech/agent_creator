const fs = require('fs');
const checks = [
  ['README_PHASE86_0.md', 'Phase 86.0'],
  ['frontend/lib/p86-0-store.ts', "phase: '86.0'"],
  ['frontend/lib/p86-0-store.ts', "priorReceiptPhase: '85.0'"],
  ['frontend/lib/p86-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p86-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p86-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p86-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p86-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p86-0/route.ts', 'getP860Boundary'],
  ['frontend/app/p86-0/page.tsx', 'Phase 86.0'],
  ['package.json', 'phase86:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 86.0 verification OK.');
