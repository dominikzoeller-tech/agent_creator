const fs = require('fs');

const checks = [
  ['README_PHASE121_3.md', 'Phase 121.3'],
  ['README_PHASE121_3.md', 'Privacy Gate MVP'],
  ['README_PHASE121_3.md', 'Privacy Gate Status'],
  ['README_PHASE121_3.md', 'Privacy Gate Decision Flow'],
  ['README_PHASE121_3.md', '/cmt/privacy'],
  ['README_PHASE121_3.md', '/cmt/privacy/status'],
  ['README_PHASE121_3.md', '/cmt/privacy/decision'],
  ['README_PHASE121_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE121_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE121_3.md', 'Phase 122.0'],
  ['frontend/lib/cmt-privacy-gate.ts', 'evaluatePrivacyGate'],
  ['frontend/lib/cmt-privacy-status.ts', 'getPrivacyGateStatus'],
  ['frontend/lib/cmt-privacy-decision.ts', 'decidePrivacyAction'],
  ['package.json', 'phase121:3:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 121.3 Privacy Gate Handoff verification OK.');
