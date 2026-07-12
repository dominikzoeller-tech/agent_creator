
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredFiles = [
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx',
];

const requiredFragments = [
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "provider: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenIssued: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenActivated: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenConsumed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'approvalCandidateApproved: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'approvalCandidateExecuted: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'promptPayloadPresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'secretsPresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'providerResponsePresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "auditEventType: 'agent_registry_status_changed'"],
  ['package.json', 'phase48:1:verify'],
];

let failed = false;
for (const file of requiredFiles) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    console.error(`MISSING ${file}`);
    failed = true;
  } else {
    console.log(`OK ${file}`);
  }
}

for (const [file, fragment] of requiredFragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) {
    console.error(`MISSING FRAGMENT ${fragment} in ${file}`);
    failed = true;
  } else {
    console.log(`OK fragment ${fragment}`);
  }
}

if (failed) {
  console.error('Phase 48.1 verification failed.');
  process.exit(1);
}

console.log('Phase 48.1 verification OK.');
