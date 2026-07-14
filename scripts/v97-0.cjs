const fs = require('fs');
const checks = [
  ['README_PHASE97_0.md', 'Phase 97.0'],
  ['frontend/lib/p97-0-store.ts', "phase: '97.0'"],
  ['frontend/lib/p97-0-store.ts', "priorBoundaryPhase: '96.0'"],
  ['frontend/lib/p97-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p97-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p97-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p97-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p97-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p97-0/route.ts', 'getP970Receipt'],
  ['frontend/app/p97-0/page.tsx', 'Phase 97.0'],
  ['package.json', 'phase97:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 97.0 verification OK.');
