const fs = require('fs');
const checks = [
  ['README_PHASE102_1.md', 'Phase 102.1'],
  ['frontend/lib/p102-1-store.ts', "auditPhase: '102.1'"],
  ['frontend/lib/p102-1-store.ts', 'getP1020Boundary'],
  ['frontend/lib/p102-1-store.ts', 'policyAuditRecorded: true'],
  ['frontend/lib/p102-1-store.ts', "auditType: 'agent_registry_status_changed'"],
  ['frontend/app/api/p102-1/route.ts', 'getP1021Audit'],
  ['frontend/app/p102-1/page.tsx', 'Phase 102.1'],
  ['frontend/app/p102-1/page.tsx', 'audit.provider'],
  ['frontend/app/p102-1/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p102-1/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p102-1/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p102-1/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p102-1/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase102:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 102.1 verification OK.');
