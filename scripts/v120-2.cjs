const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentEntry'],
  ['frontend/lib/cmt-master-entry.ts', "phase: '120.2'"],
  ['frontend/lib/cmt-master-entry.ts', "label: 'Master Agent Entry'"],
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-entry.ts', "primaryHref: '/cmt/master'"],
  ['frontend/lib/cmt-master-entry.ts', "statusHref: '/cmt/master/status'"],
  ['frontend/lib/cmt-master-entry.ts', "committeeHref: '/cmt/ask'"],
  ['frontend/lib/cmt-master-entry.ts', 'visibleAsMainEntryCandidate: true'],
  ['frontend/lib/cmt-master-entry.ts', 'liveModel: false'],
  ['frontend/lib/cmt-master-entry.ts', 'internet: false'],
  ['frontend/app/api/cmt/master/entry/route.ts', 'getMasterAgentEntry'],
  ['frontend/app/cmt/master/entry/page.tsx', 'Phase 120.2'],
  ['frontend/app/cmt/master/entry/page.tsx', 'Zentrale Links'],
  ['README_PHASE120_2.md', 'Master Agent Entry'],
  ['package.json', 'phase120:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.2 Master Agent Entry verification OK.');
