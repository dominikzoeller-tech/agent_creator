const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-status.ts', 'getPrivacyGateStatus'],
  ['frontend/lib/cmt-privacy-status.ts', "phase: '121.1'"],
  ['frontend/lib/cmt-privacy-status.ts', "label: 'Privacy Gate Status'"],
  ['frontend/lib/cmt-privacy-status.ts', "currentMode: 'privacy-gate-local-testable'"],
  ['frontend/lib/cmt-privacy-status.ts', "mainPage: '/cmt/privacy'"],
  ['frontend/lib/cmt-privacy-status.ts', "apiRoute: '/api/cmt/privacy'"],
  ['frontend/lib/cmt-privacy-status.ts', 'detectsInternalData: true'],
  ['frontend/lib/cmt-privacy-status.ts', 'anonymizedPreviewEnabled: true'],
  ['frontend/lib/cmt-privacy-status.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-privacy-status.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/privacy/status/route.ts', 'getPrivacyGateStatus'],
  ['frontend/app/cmt/privacy/status/page.tsx', 'Phase 121.1'],
  ['frontend/app/cmt/privacy/status/page.tsx', 'Freigabeoptionen vorbereitet'],
  ['README_PHASE121_1.md', 'Privacy Gate Status'],
  ['package.json', 'phase121:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.1 Privacy Gate Status verification OK.');
