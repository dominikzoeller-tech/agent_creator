const fs = require('fs');
const checks = [
  ['README_PHASE100_1.md', 'Phase 100.1'],
  ['frontend/lib/p100-1-store.ts', "auditPhase: '100.1'"],
  ['frontend/lib/p100-1-store.ts', 'getP1000Boundary'],
  ['frontend/lib/p100-1-store.ts', 'policyAuditRecorded: true'],
  ['frontend/lib/p100-1-store.ts', "auditType: 'agent_registry_status_changed'"],
  ['frontend/app/api/p100-1/route.ts', 'getP1001Audit'],
  ['frontend/app/p100-1/page.tsx', 'Phase 100.1'],
  ['frontend/app/p100-1/page.tsx', 'audit.provider'],
  ['frontend/app/p100-1/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p100-1/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p100-1/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p100-1/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p100-1/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase100:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 100.1 verification OK.');
