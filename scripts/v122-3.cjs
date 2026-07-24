const fs = require('fs');

const checks = [
  ['README_PHASE122_3.md', 'Phase 122.3'],
  ['README_PHASE122_3.md', 'Secure Master Agent MVP'],
  ['README_PHASE122_3.md', 'Secure Master Agent Status'],
  ['README_PHASE122_3.md', 'Secure Master Agent Guide'],
  ['README_PHASE122_3.md', '/cmt/master/secure'],
  ['README_PHASE122_3.md', 'Master-Agent ist lokal testbar'],
  ['README_PHASE122_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE122_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE122_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE122_3.md', 'Phase 123.0'],
  ['frontend/lib/cmt-master-secure.ts', 'askSecureMasterAgent'],
  ['frontend/lib/cmt-master-secure-status.ts', 'getSecureMasterStatus'],
  ['frontend/lib/cmt-master-secure-guide.ts', 'getSecureMasterGuide'],
  ['package.json', 'phase122:3:verify'],
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
console.log('Phase 122.3 Secure Master Agent Handoff verification OK.');
