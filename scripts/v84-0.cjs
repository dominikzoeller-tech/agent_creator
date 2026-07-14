const fs = require('fs');
const checks = [
  ['README_PHASE84_0.md', 'Phase 84.0'],
  ['frontend/lib/p84-0-store.ts', "phase: '84.0'"],
  ['frontend/lib/p84-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p84-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p84-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p84-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p84-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p84-0/route.ts', 'getP840Boundary'],
  ['frontend/app/p84-0/page.tsx', 'Phase 84.0'],
  ['package.json', 'phase84:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 84.0 verification OK.');
