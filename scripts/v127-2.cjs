const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-entry.ts', 'getSecureMasterMainEntry'],
  ['frontend/lib/cmt-master-main-entry.ts', "phase: '127.2'"],
  ['frontend/lib/cmt-master-main-entry.ts', "primaryMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-entry.ts', 'mainPageUsesUnifiedFlow: true'],
  ['frontend/lib/cmt-master-main-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/entry/route.ts', 'getSecureMasterMainEntry'],
  ['frontend/app/cmt/master/secure/main/entry/page.tsx', 'Secure Master Hauptseite'],
  ['frontend/app/cmt/master/secure/main/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE127_2.md', 'Secure Master Main View Entry'],
  ['package.json', 'phase127:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.2 Secure Master Main View Entry verification OK.');
