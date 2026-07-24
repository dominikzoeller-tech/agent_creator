const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-view.ts', 'createCommitteeView'],
  ['frontend/lib/cmt-view.ts', 'getCommitteeViewDemo'],
  ['frontend/lib/cmt-view.ts', "phase: '112.2'"],
  ['frontend/lib/cmt-view.ts', "label: 'Gremium View'"],
  ['frontend/lib/cmt-view.ts', 'roles'],
  ['frontend/lib/cmt-view.ts', "provider: 'none'"],
  ['frontend/lib/cmt-view.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-view.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/view/route.ts', 'createCommitteeView'],
  ['frontend/app/cmt/view/page.tsx', 'Gremium View erzeugen'],
  ['frontend/app/cmt/view/page.tsx', "fetch('/api/cmt/view'"],
  ['README_PHASE112_2.md', 'Gremium View'],
  ['package.json', 'phase112:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 112.2 Gremium View verification OK.');
