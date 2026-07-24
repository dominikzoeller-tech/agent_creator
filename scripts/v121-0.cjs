const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-gate.ts', 'evaluatePrivacyGate'],
  ['frontend/lib/cmt-privacy-gate.ts', 'getPrivacyGateDemo'],
  ['frontend/lib/cmt-privacy-gate.ts', "phase: '121.0'"],
  ['frontend/lib/cmt-privacy-gate.ts', "label: 'Privacy Gate MVP'"],
  ['frontend/lib/cmt-privacy-gate.ts', "decision: 'block_external'"],
  ['frontend/lib/cmt-privacy-gate.ts', "decision: 'require_anonymization'"],
  ['frontend/lib/cmt-privacy-gate.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-privacy-gate.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/privacy/route.ts', 'evaluatePrivacyGate'],
  ['frontend/app/cmt/privacy/page.tsx', 'Privacy Gate prüfen'],
  ['frontend/app/cmt/privacy/page.tsx', 'Anonymisierte Vorschau'],
  ['README_PHASE121_0.md', 'Privacy Gate MVP'],
  ['package.json', 'phase121:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.0 Privacy Gate MVP verification OK.');
