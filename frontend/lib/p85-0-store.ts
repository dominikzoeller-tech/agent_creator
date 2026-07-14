export type P850Receipt = {
  phase: '85.0';
  priorBoundaryPhase: '84.0';
  priorPolicyAuditPhase: '84.1';
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

export function getP850Receipt(): P850Receipt {
  return {
    phase: '85.0',
    priorBoundaryPhase: '84.0',
    priorPolicyAuditPhase: '84.1',
    label: 'Seal Final Closure Receipt Completion Receipt',
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
