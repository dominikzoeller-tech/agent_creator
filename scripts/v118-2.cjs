const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonGuide'],
  ['frontend/lib/cmt-json-guide.ts', "phase: '118.2'"],
  ['frontend/lib/cmt-json-guide.ts', "label: 'Gremium Local JSON Guide'"],
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-guide.ts', 'plannedFiles'],
  ['frontend/lib/cmt-json-guide.ts', 'actualFileWriteEnabled'],
  ['frontend/lib/cmt-json-guide.ts', "provider: 'none'"],
  ['frontend/lib/cmt-json-guide.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-json-guide.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/json/guide/route.ts', 'getCommitteeLocalJsonGuide'],
  ['frontend/app/cmt/json/guide/page.tsx', 'Phase 118.2'],
  ['frontend/app/cmt/json/guide/page.tsx', 'Geplante Dateien'],
  ['README_PHASE118_2.md', 'Gremium Local JSON Guide'],
  ['package.json', 'phase118:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 118.2 Gremium Local JSON Guide verification OK.');
