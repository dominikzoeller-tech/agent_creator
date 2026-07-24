const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified.ts', 'askSecureMasterUnified'],
  ['frontend/lib/cmt-master-unified.ts', 'getSecureMasterUnifiedDemo'],
  ['frontend/lib/cmt-master-unified.ts', "phaseUnified: '126.0'"],
  ['frontend/lib/cmt-master-unified.ts', "unifiedMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-unified.ts', 'showsCommitteeWhenNeeded'],
  ['frontend/lib/cmt-master-unified.ts', 'unifiedAnswerBlocks'],
  ['frontend/app/api/cmt/master/secure/unified/route.ts', 'askSecureMasterUnified'],
  ['frontend/app/cmt/master/secure/unified/page.tsx', 'Unified Flow testen'],
  ['frontend/app/cmt/master/secure/unified/page.tsx', '5 Rollen direkt im Hauptflow'],
  ['README_PHASE126_0.md', 'Secure Master Unified Main Flow'],
  ['package.json', 'phase126:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.0 Secure Master Unified Main Flow verification OK.');
