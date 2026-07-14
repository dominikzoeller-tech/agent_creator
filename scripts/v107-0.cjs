const fs = require('fs');
const checks = [
  ['README_PHASE107_0.md', 'Phase 107.0'],
  ['frontend/lib/p107-0-store.ts', "phase: '107.0'"],
  ['frontend/lib/p107-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p107-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p107-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p107-0-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p107-0-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p107-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p107-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p107-0-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/app/api/p107-0/route.ts', 'getP1070Boundary'],
  ['frontend/app/p107-0/page.tsx', 'Phase 107.0'],
  ['package.json', 'phase107:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 107.0 verification OK.');
