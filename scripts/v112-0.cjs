const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-ask.ts', 'getCommitteeAskDemo'],
  ['frontend/lib/cmt-ask.ts', "phase: '112.0'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask UI'"],
  ['frontend/lib/cmt-ask.ts', 'createCommitteeBrief'],
  ['frontend/lib/cmt-ask.ts', "provider: 'none'"],
  ['frontend/lib/cmt-ask.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-ask.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-ask.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/ask/route.ts', 'createCommitteeAskState'],
  ['frontend/app/cmt/ask/page.tsx', 'Phase 112.0'],
  ['frontend/app/cmt/ask/page.tsx', 'textarea'],
  ['README_PHASE112_0.md', 'Gremium Ask UI'],
  ['package.json', 'phase112:0:verify'],
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
console.log('Phase 112.0 Gremium Ask UI verification OK.');
