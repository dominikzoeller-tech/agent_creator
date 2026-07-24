const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-status.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-status.ts', "phase: '120.1'"],
  ['frontend/lib/cmt-master-status.ts', "label: 'Master Agent Router Status'"],
  ['frontend/lib/cmt-master-status.ts', "currentMode: 'master-router-local-testable'"],
  ['frontend/lib/cmt-master-status.ts', "mainPage: '/cmt/master'"],
  ['frontend/lib/cmt-master-status.ts', "apiRoute: '/api/cmt/master'"],
  ['frontend/lib/cmt-master-status.ts', 'canAskCommittee: true'],
  ['frontend/lib/cmt-master-status.ts', 'canDetectPrivacyGate: true'],
  ['frontend/lib/cmt-master-status.ts', 'canDetectAgentBuilder: true'],
  ['frontend/lib/cmt-master-status.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/master/status/route.ts', 'getMasterAgentStatus'],
  ['frontend/app/cmt/master/status/page.tsx', 'Phase 120.1'],
  ['frontend/app/cmt/master/status/page.tsx', 'Empfohlene Testfragen'],
  ['README_PHASE120_1.md', 'Master Agent Router Status'],
  ['package.json', 'phase120:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.1 Master Agent Router Status verification OK.');
