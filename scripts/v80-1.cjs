const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE80_1.md', 'Phase 80.1'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit-store.ts', "Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationSealReceipt>, 'phase'>"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit-store.ts', "phase: '80.1'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit-store.ts', "receiptPhase: '80.0'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit-store.ts', 'policyAuditPassed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit-store.ts', "auditEventType: 'agent_registry_status_changed'"],
  ['frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit/route.ts', 'NextResponse.json'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-receipt-policy-audit/page.tsx', 'Phase 80.1']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase80:1:verify'] !== 'node scripts/v80-1.cjs') throw new Error('Missing script phase80:1:verify');
console.log('Phase 80.1 verification OK.');
