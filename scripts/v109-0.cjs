const fs = require('fs');
const checks = [
  ['README_PHASE109_0.md', 'Phase 109.0'],
  ['frontend/lib/p109-0-store.ts', "phase: '109.0'"],
  ['frontend/lib/p109-0-store.ts', "previousPhase: '108.3'"],
  ['frontend/lib/p109-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p109-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p109-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p109-0-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p109-0-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p109-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p109-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p109-0-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/lib/p109-0-store.ts', "policyDecision: 'blocked-dry-run-only'"],
  ['frontend/app/api/p109-0/route.ts', 'getP1090Boundary'],
  ['frontend/app/p109-0/page.tsx', 'Phase 109.0'],
  ['package.json', 'phase109:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 109.0 verification OK.');
