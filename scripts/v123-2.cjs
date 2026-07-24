const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-app-entry.ts', 'getSecureMasterAppEntry'],
  ['frontend/lib/cmt-master-app-entry.ts', "phase: '123.2'"],
  ['frontend/lib/cmt-master-app-entry.ts', "primaryHref: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-app-entry.ts', "recommendedBookmark: 'http://localhost:3001/cmt/master/secure'"],
  ['frontend/lib/cmt-master-app-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/app-entry/route.ts', 'getSecureMasterAppEntry'],
  ['frontend/app/cmt/master/app-entry/page.tsx', 'Secure Master Agent starten'],
  ['frontend/app/cmt/master/app-entry/page.tsx', 'Bookmark'],
  ['README_PHASE123_2.md', 'Secure Master App Entry'],
  ['package.json', 'phase123:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.2 Secure Master App Entry verification OK.');
