const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE79_2.md', 'Phase 79.2'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'Phase 79.2 Dashboard'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.provider'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.modelSelected'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.dryRunOnly'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard/page.tsx', 'audit.providerDispatchAllowed']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase79:2:verify'] !== 'node scripts/v79-2.cjs') throw new Error('Missing script phase79:2:verify');
if (pkg.scripts['phase79:2:smoke'] !== 'node scripts/s79-2.cjs') throw new Error('Missing script phase79:2:smoke');
console.log('Phase 79.2 verification OK.');
