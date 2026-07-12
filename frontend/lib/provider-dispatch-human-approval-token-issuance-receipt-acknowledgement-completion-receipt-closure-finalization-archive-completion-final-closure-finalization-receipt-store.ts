export type ArchiveCompletionFinalClosureFinalizationReceipt = {
  phase: '77.0';
  receiptName: string;
  priorFinalizationBoundaryClosed: true;
  provider: 'none';
  modelSelected: 'none';
  dryRunOnly: true;
  finalDispatchBlocked: true;
  executionGateClosed: true;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
};

export const archiveCompletionFinalClosureFinalizationReceipt: ArchiveCompletionFinalClosureFinalizationReceipt = {
  phase: '77.0',
  receiptName: 'archive-completion-final-closure-finalization-receipt',
  priorFinalizationBoundaryClosed: true,
  provider: 'none',
  modelSelected: 'none',
  dryRunOnly: true,
  finalDispatchBlocked: true,
  executionGateClosed: true,
  networkCallAllowed: false,
  providerDispatchAllowed: false,
  humanApprovalTokenIssued: false,
  humanApprovalTokenActivated: false,
  humanApprovalTokenConsumed: false,
  approvalCandidateApproved: false,
  approvalCandidateExecuted: false,
  promptPayloadPresent: false,
  secretsPresent: false,
  providerResponsePresent: false,
};

export function getArchiveCompletionFinalClosureFinalizationReceipt() {
  return archiveCompletionFinalClosureFinalizationReceipt;
}
