const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-secure-guide.ts', 'getSecureMasterGuide'],
  ['frontend/lib/cmt-master-secure-guide.ts', "phase: '122.2'"],
  ['frontend/lib/cmt-master-secure-guide.ts', "openNow: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-secure-guide.ts', 'Noch keine echten KI-Modell-Antworten.'],
  ['frontend/lib/cmt-master-secure-guide.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/guide/route.ts', 'getSecureMasterGuide'],
  ['frontend/app/cmt/master/secure/guide/page.tsx', 'Schnelltest'],
  ['frontend/app/cmt/master/secure/guide/page.tsx', 'Noch nicht live'],
  ['README_PHASE122_2.md', 'Secure Master Agent Guide'],
  ['package.json', 'phase122:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.2 Secure Master Agent Guide verification OK.');
