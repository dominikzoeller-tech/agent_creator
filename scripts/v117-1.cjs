const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-status.ts', "phase: '117.1'"],
  ['frontend/lib/cmt-persist-status.ts', "label: 'Gremium Persist Status'"],
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-persist-status.ts', 'storageEnabled: false'],
  ['frontend/lib/cmt-persist-status.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist-status.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist-status.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/status/route.ts', 'getCommitteePersistStatus'],
  ['frontend/app/cmt/persist/status/page.tsx', 'Phase 117.1'],
  ['frontend/app/cmt/persist/status/page.tsx', 'Zum Persist Adapter'],
  ['README_PHASE117_1.md', 'Gremium Persist Status'],
  ['package.json', 'phase117:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.1 Gremium Persist Status verification OK.');
