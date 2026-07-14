const fs = require('fs');
const checks = [
  ['README_PHASE101_2.md', 'Phase 101.2'],
  ['frontend/app/p101-2-dash/page.tsx', 'Phase 101.2 Dashboard'],
  ['frontend/app/p101-2-dash/page.tsx', 'getP1011Audit'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p101-2-dash/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase101:2:verify'],
  ['package.json', 'phase101:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 101.2 verification OK.');
