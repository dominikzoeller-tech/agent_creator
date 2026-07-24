const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-session.ts', 'createCommitteeSession'],
  ['frontend/lib/cmt-session.ts', 'getCommitteeSessionDemo'],
  ['frontend/lib/cmt-session.ts', "phase: '111.0'"],
  ['frontend/lib/cmt-session.ts', "label: 'User Frage Session'"],
  ['frontend/lib/cmt-session.ts', 'sessionId'],
  ['frontend/lib/cmt-session.ts', 'userQuestion'],
  ['frontend/lib/cmt-session.ts', 'createCommitteeDeliberation'],
  ['frontend/lib/cmt-session.ts', "provider: 'none'"],
  ['frontend/lib/cmt-session.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-session.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-session.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-session.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-session.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/session/route.ts', 'createCommitteeSession'],
  ['frontend/app/cmt/session/page.tsx', 'Phase 111.0'],
  ['README_PHASE111_0.md', 'User Frage Session'],
  ['package.json', 'phase111:0:verify'],
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
console.log('Phase 111.0 User Frage Session verification OK.');
