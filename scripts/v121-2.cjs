const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-decision.ts', 'decidePrivacyAction'],
  ['frontend/lib/cmt-privacy-decision.ts', 'getPrivacyDecisionDemo'],
  ['frontend/lib/cmt-privacy-decision.ts', "phase: '121.2'"],
  ['frontend/lib/cmt-privacy-decision.ts', "label: 'Privacy Gate Decision Flow'"],
  ['frontend/lib/cmt-privacy-decision.ts', "option === 'local_only'"],
  ['frontend/lib/cmt-privacy-decision.ts', "option === 'anonymize_then_send'"],
  ['frontend/lib/cmt-privacy-decision.ts', "Direkte externe Freigabe ist in Phase 121.2 noch blockiert."],
  ['frontend/lib/cmt-privacy-decision.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/privacy/decision/route.ts', 'decidePrivacyAction'],
  ['frontend/app/cmt/privacy/decision/page.tsx', 'Entscheidung prüfen'],
  ['frontend/app/cmt/privacy/decision/page.tsx', 'Safe Payload Preview'],
  ['README_PHASE121_2.md', 'Privacy Gate Decision Flow'],
  ['package.json', 'phase121:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.2 Privacy Gate Decision Flow verification OK.');
