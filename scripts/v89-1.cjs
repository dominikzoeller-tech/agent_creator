const fs = require('fs');
const checks = [
  ['README_PHASE89_1.md', 'Phase 89.1'],
  ['frontend/lib/p89-1-store.ts', "phase: '89.1'"],
  ['frontend/lib/p89-1-store.ts', "receiptPhase: '89.0'"],
  ['frontend/lib/p89-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p89-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p89-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p89-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p89-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p89-1/route.ts', 'getP891Audit'],
  ['frontend/app/p89-1/page.tsx', 'Phase 89.1'],
  ['package.json', 'phase89:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 89.1 verification OK.');
