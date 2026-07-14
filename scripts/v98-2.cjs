const fs = require('fs');
const checks = [
  ['README_PHASE98_2.md', 'Phase 98.2'],
  ['frontend/app/p98-2-dash/page.tsx', 'Phase 98.2 Dashboard'],
  ['frontend/app/p98-2-dash/page.tsx', 'getP981Audit'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p98-2-dash/page.tsx', 'audit.providerDispatchAllowed'],
  ['package.json', 'phase98:2:verify'],
  ['package.json', 'phase98:2:smoke'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 98.2 verification OK.');
