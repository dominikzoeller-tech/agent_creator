const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-brief.ts', 'createCommitteeBrief'],
  ['frontend/lib/cmt-brief.ts', 'getCommitteeBriefDemo'],
  ['frontend/lib/cmt-brief.ts', "phase: '111.2'"],
  ['frontend/lib/cmt-brief.ts', "label: 'Gremium Brief'"],
  ['frontend/lib/cmt-brief.ts', 'userMessage'],
  ['frontend/lib/cmt-brief.ts', 'actions'],
  ['frontend/lib/cmt-brief.ts', "provider: 'none'"],
  ['frontend/lib/cmt-brief.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-brief.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-brief.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-brief.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-brief.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/brief/route.ts', 'createCommitteeBrief'],
  ['frontend/app/cmt/brief/page.tsx', 'Phase 111.2'],
  ['README_PHASE111_2.md', 'Gremium Brief'],
  ['package.json', 'phase111:2:verify'],
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
console.log('Phase 111.2 Gremium Brief verification OK.');
