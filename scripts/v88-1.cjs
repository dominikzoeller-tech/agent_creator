const fs = require('fs');
const checks = [
  ['README_PHASE88_1.md', 'Phase 88.1'],
  ['frontend/lib/p88-1-store.ts', "phase: '88.1'"],
  ['frontend/lib/p88-1-store.ts', "boundaryPhase: '88.0'"],
  ['frontend/lib/p88-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p88-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p88-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p88-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p88-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p88-1/route.ts', 'getP881Audit'],
  ['frontend/app/p88-1/page.tsx', 'Phase 88.1'],
  ['package.json', 'phase88:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 88.1 verification OK.');
