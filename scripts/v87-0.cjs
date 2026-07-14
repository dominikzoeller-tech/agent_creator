const fs = require('fs');
const checks = [
  ['README_PHASE87_0.md', 'Phase 87.0'],
  ['frontend/lib/p87-0-store.ts', "phase: '87.0'"],
  ['frontend/lib/p87-0-store.ts', "priorBoundaryPhase: '86.0'"],
  ['frontend/lib/p87-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p87-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p87-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p87-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p87-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p87-0/route.ts', 'getP870Receipt'],
  ['frontend/app/p87-0/page.tsx', 'Phase 87.0'],
  ['package.json', 'phase87:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 87.0 verification OK.');
