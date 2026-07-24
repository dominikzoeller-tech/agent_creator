const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-home.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-home.ts', "phase: '116.1'"],
  ['frontend/lib/cmt-home.ts', "label: 'Gremium Home Entry'"],
  ['frontend/lib/cmt-home.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-home.ts', "provider: 'none'"],
  ['frontend/lib/cmt-home.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-home.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/home/route.ts', 'getCommitteeHomeEntry'],
  ['frontend/app/cmt/home/page.tsx', 'Phase 116.1'],
  ['frontend/app/cmt/home/page.tsx', 'Navigation Snapshot'],
  ['README_PHASE116_1.md', 'Gremium Home Entry'],
  ['package.json', 'phase116:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.1 Gremium Home Entry verification OK.');
