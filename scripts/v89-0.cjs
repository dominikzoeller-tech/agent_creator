const fs = require('fs');
const checks = [
  ['README_PHASE89_0.md', 'Phase 89.0'],
  ['frontend/lib/p89-0-store.ts', "phase: '89.0'"],
  ['frontend/lib/p89-0-store.ts', "priorBoundaryPhase: '88.0'"],
  ['frontend/lib/p89-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p89-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p89-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p89-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p89-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p89-0/route.ts', 'getP890Receipt'],
  ['frontend/app/p89-0/page.tsx', 'Phase 89.0'],
  ['package.json', 'phase89:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 89.0 verification OK.');
