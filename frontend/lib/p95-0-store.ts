export type P950Receipt = {
  phase: '95.0';
  priorBoundaryPhase: '94.0';
  priorPolicyAuditPhase: '94.1';
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

export function getP950Receipt(): P950Receipt {
  return {
    phase: '95.0',
    priorBoundaryPhase: '94.0',
    priorPolicyAuditPhase: '94.1',
    label: 'Seal Final Closure Receipt Completion Final Closure Final Receipt Seal Receipt',
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
