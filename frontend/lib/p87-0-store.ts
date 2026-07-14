export type P870Receipt = {
  phase: '87.0';
  priorBoundaryPhase: '86.0';
  priorPolicyAuditPhase: '86.1';
  label: string;
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
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
  receiptRecorded: true;
};

export function getP870Receipt(): P870Receipt {
  return {
    phase: '87.0',
    priorBoundaryPhase: '86.0',
    priorPolicyAuditPhase: '86.1',
    label: 'Seal Final Closure Receipt Completion Closure Receipt',
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
    promptPayloadPresent: false,
    secretsPresent: false,
    providerResponsePresent: false,
    receiptRecorded: true,
  };
}
