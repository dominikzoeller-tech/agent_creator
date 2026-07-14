const fs = require('fs');
const checks = [
  ['README_PHASE92_0.md', 'Phase 92.0'],
  ['frontend/lib/p92-0-store.ts', "phase: '92.0'"],
  ['frontend/lib/p92-0-store.ts', "priorReceiptPhase: '91.0'"],
  ['frontend/lib/p92-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p92-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p92-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p92-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p92-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p92-0/route.ts', 'getP920Boundary'],
  ['frontend/app/p92-0/page.tsx', 'Phase 92.0'],
  ['package.json', 'phase92:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 92.0 verification OK.');
