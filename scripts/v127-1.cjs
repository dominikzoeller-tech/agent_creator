const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-status.ts', 'getSecureMasterMainStatus'],
  ['frontend/lib/cmt-master-main-status.ts', "phase: '127.1'"],
  ['frontend/lib/cmt-master-main-status.ts', "mainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-main-status.ts', 'mainPageUsesUnifiedFlow: true'],
  ['frontend/lib/cmt-master-main-status.ts', 'controlPagesKept: true'],
  ['frontend/lib/cmt-master-main-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/status/route.ts', 'getSecureMasterMainStatus'],
  ['frontend/app/cmt/master/secure/main/status/page.tsx', 'Main State'],
  ['frontend/app/cmt/master/secure/main/status/page.tsx', 'Kontrollseiten'],
  ['README_PHASE127_1.md', 'Secure Master Main View Status'],
  ['package.json', 'phase127:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.1 Secure Master Main View Status verification OK.');
