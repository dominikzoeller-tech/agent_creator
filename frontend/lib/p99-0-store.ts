export type P990Receipt = {
  phase: '99.0';
  priorBoundaryPhase: '98.0';
  priorPolicyAuditPhase: '98.1';
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

export function getP990Receipt(): P990Receipt {
  return {
    phase: '99.0',
    priorBoundaryPhase: '98.0',
    priorPolicyAuditPhase: '98.1',
    label: 'Seal Final Closure Receipt Completion Final Seal Closure Receipt',
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
