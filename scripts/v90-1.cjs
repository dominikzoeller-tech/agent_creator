const fs = require('fs');
const checks = [
  ['README_PHASE90_1.md', 'Phase 90.1'],
  ['frontend/lib/p90-1-store.ts', "phase: '90.1'"],
  ['frontend/lib/p90-1-store.ts', "boundaryPhase: '90.0'"],
  ['frontend/lib/p90-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p90-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p90-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p90-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p90-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p90-1/route.ts', 'getP901Audit'],
  ['frontend/app/p90-1/page.tsx', 'Phase 90.1'],
  ['package.json', 'phase90:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 90.1 verification OK.');
