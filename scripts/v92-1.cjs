const fs = require('fs');
const checks = [
  ['README_PHASE92_1.md', 'Phase 92.1'],
  ['frontend/lib/p92-1-store.ts', "phase: '92.1'"],
  ['frontend/lib/p92-1-store.ts', "boundaryPhase: '92.0'"],
  ['frontend/lib/p92-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p92-1-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p92-1-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p92-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p92-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p92-1/route.ts', 'getP921Audit'],
  ['frontend/app/p92-1/page.tsx', 'Phase 92.1'],
  ['package.json', 'phase92:1:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 92.1 verification OK.');
