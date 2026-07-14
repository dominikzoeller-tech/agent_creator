const fs = require('fs');
const checks = [
  ['README_PHASE83_0.md', 'Phase 83.0'],
  ['frontend/lib/p83-0-store.ts', "phase: '83.0'"],
  ['frontend/lib/p83-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p83-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p83-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p83-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p83-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p83-0/route.ts', 'getP830Boundary'],
  ['frontend/app/p83-0/page.tsx', 'Phase 83.0'],
  ['package.json', 'phase83:0:verify'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 83.0 verification OK.');
