const fs = require('fs');
const checks = [
  ['README_PHASE127_3.md', 'Phase 127.3'],
  ['README_PHASE127_3.md', 'Secure Master Main Unified View'],
  ['README_PHASE127_3.md', 'Secure Master Main View Status'],
  ['README_PHASE127_3.md', 'Secure Master Main View Entry'],
  ['README_PHASE127_3.md', '/cmt/master/secure'],
  ['README_PHASE127_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE127_3.md', 'Hauptseite nutzt den Unified Flow'],
  ['README_PHASE127_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE127_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE127_3.md', 'Phase 128.0'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Unified Main View'],
  ['frontend/lib/cmt-master-main-status.ts', 'getSecureMasterMainStatus'],
  ['frontend/lib/cmt-master-main-entry.ts', 'getSecureMasterMainEntry'],
  ['package.json', 'phase127:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.3 Secure Master Main View Handoff verification OK.');
