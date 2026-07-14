const fs = require('fs');
const checks = [
  ['README_PHASE106_0.md', 'Phase 106.0'],
  ['frontend/lib/p106-0-store.ts', "phase: '106.0'"],
  ['frontend/lib/p106-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p106-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p106-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p106-0-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p106-0-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p106-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p106-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p106-0-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/app/api/p106-0/route.ts', 'getP1060Boundary'],
  ['frontend/app/p106-0/page.tsx', 'Phase 106.0'],
  ['package.json', 'phase106:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 106.0 verification OK.');
