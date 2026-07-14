const fs = require('fs');
const checks = [
  ['README_PHASE97_1.md', 'Phase 97.1'],
  ['frontend/lib/p97-1-store.ts', "phase: '97.1'"],
  ['frontend/lib/p97-1-store.ts', "receiptPhase: '97.0'"],
  ['frontend/lib/p97-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p97-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p97-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p97-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p97-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p97-1/route.ts', 'getP971Audit'],
  ['frontend/app/p97-1/page.tsx', 'Phase 97.1'],
  ['package.json', 'phase97:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 97.1 verification OK.');
