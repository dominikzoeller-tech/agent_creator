const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistGuide'],
  ['frontend/lib/cmt-persist-guide.ts', "phase: '117.2'"],
  ['frontend/lib/cmt-persist-guide.ts', "label: 'Gremium Persist Guide'"],
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-guide.ts', 'local-json'],
  ['frontend/lib/cmt-persist-guide.ts', 'externalStorageEnabled'],
  ['frontend/lib/cmt-persist-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-persist-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-persist-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/persist/guide/route.ts', 'getCommitteePersistGuide'],
  ['frontend/app/cmt/persist/guide/page.tsx', 'Phase 117.2'],
  ['frontend/app/cmt/persist/guide/page.tsx', 'Jetzt blockiert'],
  ['README_PHASE117_2.md', 'Gremium Persist Guide'],
  ['package.json', 'phase117:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 117.2 Gremium Persist Guide verification OK.');
