const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist.ts', 'createCommitteePersistAdapter'],
  ['frontend/lib/cmt-persist.ts', 'getCommitteePersistAdapterDemo'],
  ['frontend/lib/cmt-persist.ts', "phase: '117.0'"],
  ['frontend/lib/cmt-persist.ts', "label: 'Gremium Persist Adapter'"],
  ['frontend/lib/cmt-persist.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-persist.ts', 'externalStorageEnabled: false'],
  ['frontend/lib/cmt-persist.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/route.ts', 'createCommitteePersistAdapter'],
  ['frontend/app/cmt/persist/page.tsx', 'Phase 117.0'],
  ['frontend/app/cmt/persist/page.tsx', 'Persistenz-Adapter'],
  ['README_PHASE117_0.md', 'Gremium Persist Adapter'],
  ['package.json', 'phase117:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.0 Gremium Persist Adapter verification OK.');
