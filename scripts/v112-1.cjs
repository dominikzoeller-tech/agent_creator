const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-run.ts', 'createCommitteeRun'],
  ['frontend/lib/cmt-run.ts', 'getCommitteeRunDemo'],
  ['frontend/lib/cmt-run.ts', "phase: '112.1'"],
  ['frontend/lib/cmt-run.ts', "label: 'Gremium Run'"],
  ['frontend/lib/cmt-run.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-run.ts', "provider: 'none'"],
  ['frontend/lib/cmt-run.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-run.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/run/route.ts', 'createCommitteeRun'],
  ['frontend/app/cmt/run/page.tsx', 'Gremium fragen'],
  ['frontend/app/cmt/run/page.tsx', "fetch('/api/cmt/run'"],
  ['README_PHASE112_1.md', 'Gremium Run'],
  ['package.json', 'phase112:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 112.1 Gremium Run verification OK.');
