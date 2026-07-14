const fs = require('fs');
const checks = [
  ['README_PHASE106_1.md', 'Phase 106.1'],
  ['frontend/lib/p106-1-store.ts', "auditPhase: '106.1'"],
  ['frontend/lib/p106-1-store.ts', 'policyAllowsProviderDispatch: false'],
  ['frontend/lib/p106-1-store.ts', 'policyAllowsNetworkCall: false'],
  ['frontend/lib/p106-1-store.ts', 'policyAllowsExternalDataTransfer: false'],
  ['frontend/lib/p106-1-store.ts', 'policyAllowsPromptPayload: false'],
  ['frontend/lib/p106-1-store.ts', 'policyAllowsSecrets: false'],
  ['frontend/app/api/p106-1/route.ts', 'getP1061Audit'],
  ['frontend/app/p106-1/page.tsx', 'Phase 106.1'],
  ['package.json', 'phase106:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 106.1 verification OK.');
