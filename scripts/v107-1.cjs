const fs = require('fs');
const checks = [
  ['README_PHASE107_1.md', 'Phase 107.1'],
  ['frontend/lib/p107-1-store.ts', "auditPhase: '107.1'"],
  ['frontend/lib/p107-1-store.ts', 'getP1070Boundary'],
  ['frontend/lib/p107-1-store.ts', "policyDecision: 'blocked-dry-run-only'"],
  ['frontend/app/api/p107-1/route.ts', 'getP1071Audit'],
  ['frontend/app/p107-1/page.tsx', 'Phase 107.1'],
  ['package.json', 'phase107:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 107.1 verification OK.');
