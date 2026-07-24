const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json.ts', "phase: '118.0'"],
  ['frontend/lib/cmt-json.ts', "label: 'Gremium Local JSON Plan'"],
  ['frontend/lib/cmt-json.ts', 'getCommitteePersistGuide'],
  ['frontend/lib/cmt-json.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-json.ts', "target: 'local-json'"],
  ['frontend/lib/cmt-json.ts', "writeMode: 'planned-only'"],
  ['frontend/lib/cmt-json.ts', 'actualFileWriteEnabled: false'],
  ['frontend/lib/cmt-json.ts', 'externalStorageEnabled: false'],
  ['frontend/lib/cmt-json.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/route.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/app/cmt/json/page.tsx', 'Phase 118.0'],
  ['frontend/app/cmt/json/page.tsx', 'Local JSON Plan'],
  ['README_PHASE118_0.md', 'Gremium Local JSON Plan'],
  ['package.json', 'phase118:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.0 Gremium Local JSON Plan verification OK.');
