const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality-entry.ts', 'getSecureMasterQualityEntry'],
  ['frontend/lib/cmt-master-quality-entry.ts', "phase: '124.2'"],
  ['frontend/lib/cmt-master-quality-entry.ts', "primaryQualityPage: '/cmt/master/secure/quality'"],
  ['frontend/lib/cmt-master-quality-entry.ts', "qualityStatusPage: '/cmt/master/secure/quality/status'"],
  ['frontend/lib/cmt-master-quality-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/quality/entry/route.ts', 'getSecureMasterQualityEntry'],
  ['frontend/app/cmt/master/secure/quality/entry/page.tsx', 'Quality-Testseite'],
  ['frontend/app/cmt/master/secure/quality/entry/page.tsx', 'Empfohlene Nutzung'],
  ['README_PHASE124_2.md', 'Secure Master Quality Entry'],
  ['package.json', 'phase124:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.2 Secure Master Quality Entry verification OK.');
