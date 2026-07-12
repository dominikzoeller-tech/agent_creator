const fs = require('fs');
const path = require('path');
const root = process.cwd();
const storeRel = 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-store.ts';
const text = fs.readFileSync(path.join(root, storeRel), 'utf8');
const required = [
  "Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationReceipt>, 'phase'>",
  "phase: '77.1'",
  "receiptPhase: '77.0'",
  "policyAuditPassed: true",
  "auditEventType: 'agent_registry_status_changed'"
];
for (const frag of required) {
  if (!text.includes(frag)) throw new Error('Missing fragment: ' + frag);
  console.log('OK fragment', frag);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase77:2a:verify'] !== 'node scripts/v77-2a.cjs') throw new Error('Missing script phase77:2a:verify');
console.log('Phase 77.2a verification OK.');
