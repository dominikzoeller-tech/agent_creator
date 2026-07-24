const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'askCommitteeLocal'],
  ['frontend/lib/cmt-ask.ts', 'getCommitteeAskDemo'],
  ['frontend/lib/cmt-ask.ts', "phase: '119.0'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask MVP'"],
  ['frontend/lib/cmt-ask.ts', "usableStatus: 'local-testable'"],
  ['frontend/lib/cmt-ask.ts', 'liveModelEnabled: false'],
  ['frontend/lib/cmt-ask.ts', "provider: 'none'"],
  ['frontend/lib/cmt-ask.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/ask/route.ts', 'askCommitteeLocal'],
  ['frontend/app/cmt/ask/page.tsx', 'Gremium fragen'],
  ['frontend/app/cmt/ask/page.tsx', 'Lokal testbar'],
  ['README_PHASE119_0.md', '/cmt/ask'],
  ['package.json', 'phase119:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.0 Gremium Ask MVP verification OK.');
