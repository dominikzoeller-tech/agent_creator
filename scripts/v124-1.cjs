const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality-status.ts', 'getSecureMasterQualityStatus'],
  ['frontend/lib/cmt-master-quality-status.ts', "phase: '124.1'"],
  ['frontend/lib/cmt-master-quality-status.ts', "mainQualityPage: '/cmt/master/secure/quality'"],
  ['frontend/lib/cmt-master-quality-status.ts', 'localAnswersImproved: true'],
  ['frontend/lib/cmt-master-quality-status.ts', 'intentDetectionEnabled: true'],
  ['frontend/lib/cmt-master-quality-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/quality/status/route.ts', 'getSecureMasterQualityStatus'],
  ['frontend/app/cmt/master/secure/quality/status/page.tsx', 'Quality State'],
  ['frontend/app/cmt/master/secure/quality/status/page.tsx', 'Unterstützte Intents'],
  ['README_PHASE124_1.md', 'Secure Master Quality Status'],
  ['package.json', 'phase124:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.1 Secure Master Quality Status verification OK.');
