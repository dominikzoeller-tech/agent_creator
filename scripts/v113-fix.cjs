const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-hist.ts', 'createCommitteeHistory'],
  ['frontend/app/api/cmt/hist/route.ts', 'createCommitteeHistory'],
  ['frontend/app/cmt/hist/page.tsx', 'Phase 113.0'],
  ['frontend/app/cmt/save/page.tsx', 'String.fromCharCode(10)'],
  ['frontend/app/cmt/save/page.tsx', 'Session speichern'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 113 hotfix verification OK.');
