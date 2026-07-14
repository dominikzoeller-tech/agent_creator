const fs = require('fs');
const checks = [
  ['README_PHASE105_1.md', 'Phase 105.1'],
  ['frontend/lib/p105-1-store.ts', "auditPhase: '105.1'"],
  ['frontend/lib/p105-1-store.ts', 'policyAllowsProviderDispatch: false'],
  ['frontend/lib/p105-1-store.ts', 'policyAllowsNetworkCall: false'],
  ['frontend/lib/p105-1-store.ts', 'policyAllowsExternalDataTransfer: false'],
  ['frontend/lib/p105-1-store.ts', 'policyAllowsPromptPayload: false'],
  ['frontend/lib/p105-1-store.ts', 'policyAllowsSecrets: false'],
  ['frontend/app/api/p105-1/route.ts', 'getP1051Audit'],
  ['frontend/app/p105-1/page.tsx', 'Phase 105.1'],
  ['package.json', 'phase105:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 105.1 verification OK.');
