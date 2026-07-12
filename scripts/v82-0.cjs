const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE82_0.md', 'Phase 82.0'],
  ['frontend/lib/p82-0-store.ts', "phase: '82.0'"],
  ['frontend/lib/p82-0-store.ts', 'priorSealFinalReceiptClosed: true'],
  ['frontend/lib/p82-0-store.ts', 'sealFinalClosureBoundaryClosed: true'],
  ['frontend/lib/p82-0-store.ts', "provider: 'none'"],
  ['frontend/lib/p82-0-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/p82-0-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/p82-0-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p82-0-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p82-0-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p82-0-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p82-0/route.ts', 'NextResponse.json'],
  ['frontend/app/p82-0/page.tsx', 'Phase 82.0']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase82:0:verify'] !== 'node scripts/v82-0.cjs') throw new Error('Missing script phase82:0:verify');
console.log('Phase 82.0 verification OK.');
