const fs = require('fs');

const checks = [
  ['README_PHASE120_3.md', 'Phase 120.3'],
  ['README_PHASE120_3.md', 'Master Agent Router MVP'],
  ['README_PHASE120_3.md', 'Master Agent Router Status'],
  ['README_PHASE120_3.md', 'Master Agent Entry'],
  ['README_PHASE120_3.md', 'privacy_gate'],
  ['README_PHASE120_3.md', 'agent_builder'],
  ['README_PHASE120_3.md', 'provider = none'],
  ['README_PHASE120_3.md', 'liveModelEnabled = false'],
  ['README_PHASE120_3.md', 'internetAccessEnabled = false'],
  ['README_PHASE120_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE120_3.md', 'Phase 121.0'],
  ['frontend/lib/cmt-master.ts', 'askMasterAgentLocal'],
  ['frontend/lib/cmt-master-status.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentEntry'],
  ['package.json', 'phase120:3:verify'],
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
console.log('Phase 120.3 Master Agent Router Handoff verification OK.');
