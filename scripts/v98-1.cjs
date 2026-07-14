const fs = require('fs');
const checks = [
  ['README_PHASE98_1.md', 'Phase 98.1'],
  ['frontend/lib/p98-1-store.ts', "phase: '98.1'"],
  ['frontend/lib/p98-1-store.ts', "boundaryPhase: '98.0'"],
  ['frontend/lib/p98-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p98-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p98-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p98-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p98-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p98-1/route.ts', 'getP981Audit'],
  ['frontend/app/p98-1/page.tsx', 'Phase 98.1'],
  ['package.json', 'phase98:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 98.1 verification OK.');
