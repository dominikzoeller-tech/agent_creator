const fs = require('fs');
const checks = [
  ['README_PHASE94_1.md', 'Phase 94.1'],
  ['frontend/lib/p94-1-store.ts', "phase: '94.1'"],
  ['frontend/lib/p94-1-store.ts', "boundaryPhase: '94.0'"],
  ['frontend/lib/p94-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p94-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p94-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p94-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p94-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p94-1/route.ts', 'getP941Audit'],
  ['frontend/app/p94-1/page.tsx', 'Phase 94.1'],
  ['package.json', 'phase94:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 94.1 verification OK.');
