const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality.ts', 'askSecureMasterQuality'],
  ['frontend/lib/cmt-master-quality.ts', 'getSecureMasterQualityDemo'],
  ['frontend/lib/cmt-master-quality.ts', "phaseQuality: '124.0'"],
  ['frontend/lib/cmt-master-quality.ts', "committee_decision"],
  ['frontend/lib/cmt-master-quality.ts', "tool_required"],
  ['frontend/lib/cmt-master-quality.ts', "agent_builder"],
  ['frontend/lib/cmt-master-quality.ts', "Noch nicht live schalten."],
  ['frontend/app/api/cmt/master/secure/quality/route.ts', 'askSecureMasterQuality'],
  ['frontend/app/cmt/master/secure/quality/page.tsx', 'Qualitätsantwort testen'],
  ['frontend/app/cmt/master/secure/quality/page.tsx', 'Verbesserte Antwort'],
  ['README_PHASE124_0.md', 'Secure Master Local Answer Quality'],
  ['package.json', 'phase124:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.0 Secure Master Local Answer Quality verification OK.');
