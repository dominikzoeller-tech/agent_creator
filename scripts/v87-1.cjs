const fs = require('fs');
const checks = [
  ['README_PHASE87_1.md', 'Phase 87.1'],
  ['frontend/lib/p87-1-store.ts', "phase: '87.1'"],
  ['frontend/lib/p87-1-store.ts', "receiptPhase: '87.0'"],
  ['frontend/lib/p87-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p87-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p87-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p87-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p87-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p87-1/route.ts', 'getP871Audit'],
  ['frontend/app/p87-1/page.tsx', 'Phase 87.1'],
  ['package.json', 'phase87:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 87.1 verification OK.');
