const fs = require('fs');
const checks = [
  ['README_PHASE108_0.md', 'Phase 108.0'],
  ['frontend/lib/p108-0-store.ts', "phase: '108.0'"],
  ['frontend/lib/p108-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p108-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p108-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p108-0-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p108-0-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p108-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p108-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p108-0-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/lib/p108-0-store.ts', "policyDecision: 'blocked-dry-run-only'"],
  ['frontend/app/api/p108-0/route.ts', 'getP1080Boundary'],
  ['frontend/app/p108-0/page.tsx', 'Phase 108.0'],
  ['package.json', 'phase108:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 108.0 verification OK.');
