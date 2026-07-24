const fs = require('fs');

const checks = [
  ['README_PHASE111_3.md', 'Phase 111.3'],
  ['README_PHASE111_3.md', 'User Frage Session'],
  ['README_PHASE111_3.md', 'Gremium Ergebnis'],
  ['README_PHASE111_3.md', 'Gremium Brief'],
  ['README_PHASE111_3.md', 'provider = none'],
  ['README_PHASE111_3.md', 'dryRunOnly = true'],
  ['README_PHASE111_3.md', 'networkCallAllowed = false'],
  ['README_PHASE111_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE111_3.md', 'Phase 112.0'],
  ['frontend/lib/cmt-session.ts', 'createCommitteeSession'],
  ['frontend/lib/cmt-result.ts', 'createCommitteeDecisionResult'],
  ['frontend/lib/cmt-brief.ts', 'createCommitteeBrief'],
  ['package.json', 'phase111:3:verify'],
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
console.log('Phase 111.3 Handoff verification OK.');
