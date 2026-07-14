const fs = require('fs');
const checks = [
  ['README_PHASE91_0.md', 'Phase 91.0'],
  ['frontend/lib/p91-0-store.ts', "phase: '91.0'"],
  ['frontend/lib/p91-0-store.ts', "priorBoundaryPhase: '90.0'"],
  ['frontend/lib/p91-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p91-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p91-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p91-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p91-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p91-0/route.ts', 'getP910Receipt'],
  ['frontend/app/p91-0/page.tsx', 'Phase 91.0'],
  ['package.json', 'phase91:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 91.0 verification OK.');
