const fs = require('fs');
const checks = [
  ['frontend/lib/p109-1-store.ts', "phase: '109.1'"],
  ['frontend/lib/p109-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p109-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p109-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p109-1/route.ts', 'getPhase109SealReceiptBoundaryPolicyAudit'],
  ['frontend/app/p109-1/page.tsx', 'Phase 109.1 Policy Audit'],
  ['package.json', 'phase109:1:verify']
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}
if (!ok) process.exit(1);
console.log('Phase 109.1 verification OK.');
