const fs = require('fs');
const checks = [
  ['README_PHASE108_1.md', 'Phase 108.1'],
  ['frontend/lib/p108-1-store.ts', "auditPhase: '108.1'"],
  ['frontend/lib/p108-1-store.ts', 'getP1080Boundary'],
  ['frontend/lib/p108-1-store.ts', "policyAuditResult: 'locked'"],
  ['frontend/app/api/p108-1/route.ts', 'getP1081Audit'],
  ['frontend/app/p108-1/page.tsx', 'Phase 108.1'],
  ['package.json', 'phase108:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 108.1 verification OK.');
