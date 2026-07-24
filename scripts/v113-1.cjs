const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-save.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-save.ts', 'getCommitteeSavedSessionDemo'],
  ['frontend/lib/cmt-save.ts', "phase: '113.1'"],
  ['frontend/lib/cmt-save.ts', "label: 'Gremium Save'"],
  ['frontend/lib/cmt-save.ts', 'createCommitteeHistory'],
  ['frontend/lib/cmt-save.ts', "provider: 'none'"],
  ['frontend/lib/cmt-save.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-save.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/save/route.ts', 'createCommitteeSavedSession'],
  ['frontend/app/cmt/save/page.tsx', 'Session speichern'],
  ['frontend/app/cmt/save/page.tsx', "fetch('/api/cmt/save'"],
  ['README_PHASE113_1.md', 'Gremium Save'],
  ['package.json', 'phase113:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113.1 Gremium Save verification OK.');
