const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeAppEntry'],
  ['frontend/lib/cmt-app-entry.ts', "phase: '116.2'"],
  ['frontend/lib/cmt-app-entry.ts', "label: 'Gremium App Entry'"],
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-app-entry.ts', "provider: 'none'"],
  ['frontend/lib/cmt-app-entry.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-app-entry.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/app-entry/route.ts', 'getCommitteeAppEntry'],
  ['frontend/app/cmt/app-entry/page.tsx', 'Phase 116.2'],
  ['frontend/app/cmt/app-entry/page.tsx', 'App Routes'],
  ['README_PHASE116_2.md', 'Gremium App Entry'],
  ['package.json', 'phase116:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 116.2 Gremium App Entry verification OK.');
