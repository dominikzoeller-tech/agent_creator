const fs = require('fs');
const checks = [
  ['README_PHASE83_1.md', 'Phase 83.1'],
  ['frontend/lib/p83-1-store.ts', "phase: '83.1'"],
  ['frontend/lib/p83-1-store.ts', "boundaryPhase: '83.0'"],
  ['frontend/lib/p83-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p83-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p83-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p83-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p83-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p83-1/route.ts', 'getP831Audit'],
  ['frontend/app/p83-1/page.tsx', 'Phase 83.1'],
  ['package.json', 'phase83:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 83.1 verification OK.');
