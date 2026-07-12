export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationLockReceipt = {
  id: string;
  phase: '56.0';
  name: string;
  status: 'lock_receipt_only';
  summary: string;
  priorLockBoundaryClosed: true;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  lockReceiptChecks: Array<{ id: string; label: string; passed: true; detail: string }>;
};

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationLockReceipt(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationLockReceipt {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-lock-receipt-v1',
    phase: '56.0',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Lock Receipt',
    status: 'lock_receipt_only',
    summary: 'Read-only lock receipt after closure finalization lock boundary policy audit. No dispatch capability is enabled.',
    priorLockBoundaryClosed: true,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    promptPayloadPresent: false,
    secretsPresent: false,
    providerResponsePresent: false,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    lockReceiptChecks: [
      { id: 'prior-lock-boundary-closed', label: 'Prior lock boundary closed', passed: true, detail: 'The lock boundary policy audit is treated as closed before this lock receipt is recorded.' },
      { id: 'lock-receipt-dry-run-only', label: 'Lock receipt dry-run only', passed: true, detail: 'This receipt records lock state only and does not mutate token or dispatch state.' },
      { id: 'dispatch-blocked', label: 'Dispatch blocked', passed: true, detail: 'Final dispatch remains blocked and execution gate remains closed.' },
      { id: 'no-provider-data', label: 'No provider data', passed: true, detail: 'No provider, model, prompt payload, secret, network call, or provider response exists.' },
    ],
  };
}
