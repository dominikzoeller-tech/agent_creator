const fs = require('fs');
const checks = [
  ['README_PHASE104_0.md', 'Phase 104.0'],
  ['frontend/lib/p104-0-store.ts', "phase: '104.0'"],
  ['frontend/lib/p104-0-store.ts', "priorBoundaryPhase: '103.0'"],
  ['frontend/lib/p104-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p104-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p104-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p104-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p104-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p104-0/route.ts', 'getP1040Boundary'],
  ['frontend/app/p104-0/page.tsx', 'Phase 104.0'],
  ['package.json', 'phase104:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 104.0 verification OK.');
