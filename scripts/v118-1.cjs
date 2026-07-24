const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-status.ts', "phase: '118.1'"],
  ['frontend/lib/cmt-json-status.ts', "label: 'Gremium Local JSON Status'"],
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json-status.ts', "target: 'local-json'"],
  ['frontend/lib/cmt-json-status.ts', "writeMode: 'planned-only'"],
  ['frontend/lib/cmt-json-status.ts', 'actualFileWriteEnabled: false'],
  ['frontend/lib/cmt-json-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/status/route.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/app/cmt/json/status/page.tsx', 'Phase 118.1'],
  ['frontend/app/cmt/json/status/page.tsx', 'Zum Local JSON Plan'],
  ['README_PHASE118_1.md', 'Gremium Local JSON Status'],
  ['package.json', 'phase118:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.1 Gremium Local JSON Status verification OK.');
