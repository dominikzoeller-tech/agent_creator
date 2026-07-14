const fs = require('fs');
const checks = [
  ['README_PHASE103_1.md', 'Phase 103.1'],
  ['frontend/lib/p103-1-store.ts', "auditPhase: '103.1'"],
  ['frontend/lib/p103-1-store.ts', 'getP1030Boundary'],
  ['frontend/lib/p103-1-store.ts', 'policyAuditRecorded: true'],
  ['frontend/lib/p103-1-store.ts', "auditType: 'agent_registry_status_changed'"],
  ['frontend/app/api/p103-1/route.ts', 'getP1031Audit'],
  ['frontend/app/p103-1/page.tsx', 'Phase 103.1'],
  ['frontend/app/p103-1/page.tsx', 'audit.provider'],
  ['frontend/app/p103-1/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p103-1/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p103-1/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p103-1/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p103-1/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase103:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 103.1 verification OK.');
