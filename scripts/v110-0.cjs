const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-store.ts', "phase: '110.0'"],
  ['frontend/lib/cmt-store.ts', "label: 'Gremium Core'"],
  ['frontend/lib/cmt-store.ts', "id: 'strategy'"],
  ['frontend/lib/cmt-store.ts', "id: 'legal'"],
  ['frontend/lib/cmt-store.ts', "id: 'technical'"],
  ['frontend/lib/cmt-store.ts', "id: 'finance'"],
  ['frontend/lib/cmt-store.ts', "id: 'risk'"],
  ['frontend/lib/cmt-store.ts', "id: 'execution'"],
  ['frontend/lib/cmt-store.ts', "provider: 'none'"],
  ['frontend/lib/cmt-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/cmt-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/cmt-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/route.ts', 'getCommitteeCore'],
  ['frontend/app/cmt/page.tsx', 'Phase 110.0'],
  ['README_PHASE110_0.md', 'Phase 110.0'],
  ['package.json', 'phase110:0:verify'],
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
console.log('Phase 110.0 Gremium Core verification OK.');
