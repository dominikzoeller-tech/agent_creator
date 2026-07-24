const fs = require('fs');
const checks = [
  ['README_PHASE126_3.md', 'Phase 126.3'],
  ['README_PHASE126_3.md', 'Secure Master Unified Main Flow'],
  ['README_PHASE126_3.md', 'Secure Master Unified Status'],
  ['README_PHASE126_3.md', 'Secure Master Unified Entry'],
  ['README_PHASE126_3.md', '/cmt/master/secure/unified'],
  ['README_PHASE126_3.md', 'http://localhost:3001/cmt/master/secure/unified'],
  ['README_PHASE126_3.md', 'Privacy Gate, Quality-Antwort und 5er-Gremium'],
  ['README_PHASE126_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE126_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE126_3.md', 'Phase 127.0'],
  ['frontend/lib/cmt-master-unified.ts', 'askSecureMasterUnified'],
  ['frontend/lib/cmt-master-unified-status.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/lib/cmt-master-unified-entry.ts', 'getSecureMasterUnifiedEntry'],
  ['package.json', 'phase126:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.3 Secure Master Unified Handoff verification OK.');
