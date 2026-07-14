const fs = require('fs');
const checks = [
  ['README_PHASE101_1.md', 'Phase 101.1'],
  ['frontend/lib/p101-1-store.ts', "auditPhase: '101.1'"],
  ['frontend/lib/p101-1-store.ts', 'getP1010Boundary'],
  ['frontend/lib/p101-1-store.ts', 'policyAuditRecorded: true'],
  ['frontend/lib/p101-1-store.ts', "auditType: 'agent_registry_status_changed'"],
  ['frontend/app/api/p101-1/route.ts', 'getP1011Audit'],
  ['frontend/app/p101-1/page.tsx', 'Phase 101.1'],
  ['frontend/app/p101-1/page.tsx', 'audit.provider'],
  ['frontend/app/p101-1/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p101-1/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p101-1/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p101-1/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p101-1/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase101:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 101.1 verification OK.');
