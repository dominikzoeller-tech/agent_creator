const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE80_3.md', 'Phase 80.3 Final Handoff'],
  ['README_PHASE80_3.md', 'provider=none'],
  ['README_PHASE80_3.md', 'modelSelected=none'],
  ['README_PHASE80_3.md', 'dryRunOnly=true'],
  ['README_PHASE80_3.md', 'finalDispatchBlocked=true'],
  ['README_PHASE80_3.md', 'executionGateClosed=true'],
  ['README_PHASE80_3.md', 'networkCallAllowed=false'],
  ['README_PHASE80_3.md', 'providerDispatchAllowed=false']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel, fragment);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase80:3:verify'] !== 'node scripts/v80-3.cjs') throw new Error('Missing script phase80:3:verify');
if (!pkg.scripts['llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit:final:check']) throw new Error('Missing final check script');
console.log('Phase 80.3 final handoff verification OK.');
