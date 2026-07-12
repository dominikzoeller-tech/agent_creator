const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx',
  'scripts/phase70-2-smoke-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard.cjs',
  'package.json',
];
const fragments = [
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', 'Phase 70.2 Dashboard'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', "audit.provider === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', "audit.modelSelected === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', 'audit.networkCallAllowed === false'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-receipt-policy-audit-dashboard/page.tsx', 'audit.providerDispatchAllowed === false'],
  ['package.json', 'phase70:2:verify'],
  ['package.json', 'phase70:2:smoke'],
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
console.log('Phase 70.2 verification OK.');
