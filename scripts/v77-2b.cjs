const fs = require('fs');
const path = require('path');
const root = process.cwd();
const storeRel = 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-store.ts';
const text = fs.readFileSync(path.join(root, storeRel), 'utf8');
const required = [
  "Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationReceipt>, 'phase'>",
  "phase: '77.1'",
  "receiptPhase: '77.0'",
  "policyAuditPassed: true"
];
for (const x of required) {
  if (!text.includes(x)) throw new Error('Missing fragment: ' + x);
  console.log('OK fragment', x);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase77:2b:verify'] !== 'node scripts/v77-2b.cjs') throw new Error('Missing phase77:2b:verify');
console.log('Phase 77.2b verification OK.');
