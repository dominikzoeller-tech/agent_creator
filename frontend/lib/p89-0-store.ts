export type P890Receipt = {
  phase: '89.0';
  priorBoundaryPhase: '88.0';
  priorPolicyAuditPhase: '88.1';
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

export function getP890Receipt(): P890Receipt {
  return {
    phase: '89.0',
    priorBoundaryPhase: '88.0',
    priorPolicyAuditPhase: '88.1',
    label: 'Seal Final Closure Receipt Completion Final Receipt',
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
