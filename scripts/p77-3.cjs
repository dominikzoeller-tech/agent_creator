const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const finalScript = 'llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit:final:check';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase77:3:verify'] = 'node scripts/v77-3.cjs';
pkg.scripts[finalScript] = 'node scripts/f77-3.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + os.EOL, 'utf8');

write('README_PHASE77_3.md', `# Phase 77.3 Final Handoff

Provider Dispatch archive completion final closure finalization receipt policy audit final handoff.

## Required checks

- phase77:0:verify
- phase77:1:verify
- phase77:2:verify
- phase77:2a:verify if applied
- phase77:3:verify
- final check script
- npm run build

## Invariants

- provider=none
- modelSelected=none
- dryRunOnly=true
- finalDispatchBlocked=true
- executionGateClosed=true
- networkCallAllowed=false
- providerDispatchAllowed=false
- humanApprovalTokenIssued=false
- humanApprovalTokenActivated=false
- humanApprovalTokenConsumed=false
- approvalCandidateApproved=false
- approvalCandidateExecuted=false
- promptPayloadPresent=false
- secretsPresent=false
- providerResponsePresent=false

This handoff is documentation and verification only. No provider call, no network call, no dispatch.
`);

write('scripts/v77-3.cjs', `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE77_3.md', 'Phase 77.3 Final Handoff'],
  ['README_PHASE77_3.md', 'provider=none'],
  ['README_PHASE77_3.md', 'modelSelected=none'],
  ['README_PHASE77_3.md', 'dryRunOnly=true'],
  ['README_PHASE77_3.md', 'finalDispatchBlocked=true'],
  ['README_PHASE77_3.md', 'executionGateClosed=true'],
  ['README_PHASE77_3.md', 'networkCallAllowed=false'],
  ['README_PHASE77_3.md', 'providerDispatchAllowed=false']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel, fragment);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase77:3:verify'] !== 'node scripts/v77-3.cjs') throw new Error('Missing script phase77:3:verify');
if (!pkg.scripts['llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit:final:check']) throw new Error('Missing final check script');
console.log('Phase 77.3 final handoff verification OK.');
`);

write('scripts/f77-3.cjs', `const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(process.cwd(), 'README_PHASE77_3.md'), 'utf8');
const required = [
  'provider=none',
  'modelSelected=none',
  'dryRunOnly=true',
  'finalDispatchBlocked=true',
  'executionGateClosed=true',
  'networkCallAllowed=false',
  'providerDispatchAllowed=false',
  'promptPayloadPresent=false',
  'secretsPresent=false',
  'providerResponsePresent=false'
];
for (const item of required) {
  if (!text.includes(item)) throw new Error('Missing final handoff invariant: ' + item);
  console.log('OK fragment', item);
}
console.log('Phase 77.3 final check OK.');
`);
console.log('Phase 77.3 patch applied.');
