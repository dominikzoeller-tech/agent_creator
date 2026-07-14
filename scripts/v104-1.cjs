const fs = require('fs');
const checks = [
  ['README_PHASE104_1.md', 'Phase 104.1'],
  ['frontend/lib/p104-1-store.ts', "auditPhase: '104.1'"],
  ['frontend/lib/p104-1-store.ts', 'policyAuditRecorded: true'],
  ['frontend/lib/p104-1-store.ts', 'externalProviderReviewRequired: false'],
  ['frontend/lib/p104-1-store.ts', 'externalDataTransferAllowed: false'],
  ['frontend/app/api/p104-1/route.ts', 'getP1041Audit'],
  ['frontend/app/p104-1/page.tsx', 'Phase 104.1'],
  ['package.json', 'phase104:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 104.1 verification OK.');
