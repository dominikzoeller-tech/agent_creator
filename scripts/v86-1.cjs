const fs = require('fs');
const checks = [
  ['README_PHASE86_1.md', 'Phase 86.1'],
  ['frontend/lib/p86-1-store.ts', "phase: '86.1'"],
  ['frontend/lib/p86-1-store.ts', "boundaryPhase: '86.0'"],
  ['frontend/lib/p86-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p86-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p86-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p86-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p86-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p86-1/route.ts', 'getP861Audit'],
  ['frontend/app/p86-1/page.tsx', 'Phase 86.1'],
  ['package.json', 'phase86:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 86.1 verification OK.');
