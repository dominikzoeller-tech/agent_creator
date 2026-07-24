const fs = require('fs');
const checks = [
  ['frontend/app/cmt/master/secure/page.tsx', 'Unified Main View'],
  ['frontend/app/cmt/master/secure/page.tsx', '/api/cmt/master/secure/unified'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Secure Master fragen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'unifiedAnswerBlocks'],
  ['frontend/app/cmt/master/secure/page.tsx', '5 Rollen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Kontrollseiten'],
  ['frontend/app/cmt/master/secure/page.tsx', 'externalSharingAllowed'],
  ['README_PHASE127_0.md', 'Secure Master Main Unified View'],
  ['README_PHASE127_0.md', '/cmt/master/secure'],
  ['README_PHASE127_0.md', 'Hauptseite nutzt Unified Flow'],
  ['package.json', 'phase127:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.0 Secure Master Main Unified View verification OK.');
