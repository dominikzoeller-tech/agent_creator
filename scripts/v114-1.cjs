const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-report.ts', 'getCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-report.ts', "phase: '114.1'"],
  ['frontend/lib/cmt-demo-report.ts', "label: 'Gremium Demo Report'"],
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo-report.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo-report.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo-report.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/report/route.ts', 'createCommitteeDemoReport'],
  ['frontend/app/cmt/demo/report/page.tsx', 'Phase 114.1'],
  ['README_PHASE114_1.md', 'Gremium Demo Report'],
  ['package.json', 'phase114:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.1 Gremium Demo Report verification OK.');
