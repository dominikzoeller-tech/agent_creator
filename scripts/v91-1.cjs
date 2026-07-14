const fs = require('fs');
const checks = [
  ['README_PHASE91_1.md', 'Phase 91.1'],
  ['frontend/lib/p91-1-store.ts', "phase: '91.1'"],
  ['frontend/lib/p91-1-store.ts', "receiptPhase: '91.0'"],
  ['frontend/lib/p91-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p91-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p91-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p91-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p91-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p91-1/route.ts', 'getP911Audit'],
  ['frontend/app/p91-1/page.tsx', 'Phase 91.1'],
  ['package.json', 'phase91:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 91.1 verification OK.');
