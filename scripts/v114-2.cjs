const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoShare'],
  ['frontend/lib/cmt-demo-share.ts', 'getCommitteeDemoShare'],
  ['frontend/lib/cmt-demo-share.ts', "phase: '114.2'"],
  ['frontend/lib/cmt-demo-share.ts', "label: 'Gremium Demo Share'"],
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-share.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo-share.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo-share.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/share/route.ts', 'createCommitteeDemoShare'],
  ['frontend/app/cmt/demo/share/page.tsx', 'Demo-Share erzeugen'],
  ['frontend/app/cmt/demo/share/page.tsx', "fetch('/api/cmt/demo/share'"],
  ['README_PHASE114_2.md', 'Gremium Demo Share'],
  ['package.json', 'phase114:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.2 Gremium Demo Share verification OK.');
