const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-handoff.md',
  'docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-release-summary.md',
  'package.json',
];
const fragments = [
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-handoff.md', 'provider=none'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-handoff.md', 'modelSelected=none'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-handoff.md', 'dryRunOnly=true'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-handoff.md', 'final dispatch remains blocked'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit-release-summary.md', 'does not enable dispatch'],
  ['package.json', 'phase53:3:verify'],
  ['package.json', 'llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-boundary-policy-audit:final:check'],
];
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; } else console.log('OK ' + file);
}
for (const [file, fragment] of fragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) { console.error('MISSING FRAGMENT ' + fragment + ' in ' + file); failed = true; } else console.log('OK fragment ' + fragment);
}
if (failed) process.exit(1);
console.log('Phase 53.3 final handoff verification OK.');
