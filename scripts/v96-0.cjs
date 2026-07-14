const fs = require('fs');
const checks = [
  ['README_PHASE96_0.md', 'Phase 96.0'],
  ['frontend/lib/p96-0-store.ts', "phase: '96.0'"],
  ['frontend/lib/p96-0-store.ts', "priorReceiptPhase: '95.0'"],
  ['frontend/lib/p96-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p96-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p96-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p96-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p96-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p96-0/route.ts', 'getP960Boundary'],
  ['frontend/app/p96-0/page.tsx', 'Phase 96.0'],
  ['package.json', 'phase96:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 96.0 verification OK.');
