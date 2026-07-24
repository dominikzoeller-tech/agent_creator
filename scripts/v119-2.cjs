const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask-status.ts', 'getCommitteeAskStatus'],
  ['frontend/lib/cmt-ask-status.ts', "phase: '119.2'"],
  ['frontend/lib/cmt-ask-status.ts', "label: 'Gremium Ask Status'"],
  ['frontend/lib/cmt-ask-status.ts', "currentMode: 'local-testable-plus'"],
  ['frontend/lib/cmt-ask-status.ts', 'usesFiveMemberCommittee: true'],
  ['frontend/lib/cmt-ask-status.ts', 'questionIntentDetection: true'],
  ['frontend/lib/cmt-ask-status.ts', 'liveModelEnabled: false'],
  ['frontend/lib/cmt-ask-status.ts', "nextMilestone: 'master-router'"],
  ['frontend/lib/cmt-ask-status.ts', "openPage: '/cmt/ask'"],
  ['frontend/app/api/cmt/ask/status/route.ts', 'getCommitteeAskStatus'],
  ['frontend/app/cmt/ask/status/page.tsx', 'Phase 119.2'],
  ['frontend/app/cmt/ask/status/page.tsx', 'Empfohlene Testfragen'],
  ['README_PHASE119_2.md', 'Gremium Ask Status'],
  ['package.json', 'phase119:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.2 Gremium Ask Status verification OK.');
