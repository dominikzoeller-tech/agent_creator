const fs = require('fs');
const checks = [
  ['README_PHASE124_3.md', 'Phase 124.3'],
  ['README_PHASE124_3.md', 'Secure Master Local Answer Quality'],
  ['README_PHASE124_3.md', 'Secure Master Quality Status'],
  ['README_PHASE124_3.md', 'Secure Master Quality Entry'],
  ['README_PHASE124_3.md', '/cmt/master/secure/quality'],
  ['README_PHASE124_3.md', 'http://localhost:3001/cmt/master/secure/quality'],
  ['README_PHASE124_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE124_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE124_3.md', 'Phase 125.0'],
  ['frontend/lib/cmt-master-quality.ts', 'askSecureMasterQuality'],
  ['frontend/lib/cmt-master-quality-status.ts', 'getSecureMasterQualityStatus'],
  ['frontend/lib/cmt-master-quality-entry.ts', 'getSecureMasterQualityEntry'],
  ['package.json', 'phase124:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.3 Secure Master Quality Handoff verification OK.');
