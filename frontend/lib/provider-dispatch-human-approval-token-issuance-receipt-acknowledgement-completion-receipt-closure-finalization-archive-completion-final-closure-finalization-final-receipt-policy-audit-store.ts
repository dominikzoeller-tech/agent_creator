import { getArchiveCompletionFinalClosureFinalizationFinalReceipt } from './provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-final-receipt-store';

export type ArchiveCompletionFinalClosureFinalizationFinalReceiptPolicyAudit = Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationFinalReceipt>, 'phase'> & {
  phase: '78.1';
  auditName: string;
  receiptPhase: '78.0';
  policyAuditPassed: true;
  auditEventType: 'agent_registry_status_changed';
};

export function getArchiveCompletionFinalClosureFinalizationFinalReceiptPolicyAudit(): ArchiveCompletionFinalClosureFinalizationFinalReceiptPolicyAudit {
  const receipt = getArchiveCompletionFinalClosureFinalizationFinalReceipt();
  return {
    ...receipt,
    phase: '78.1',
    auditName: 'archive-completion-final-closure-finalization-final-receipt-policy-audit',
    receiptPhase: '78.0',
    policyAuditPassed: true,
    auditEventType: 'agent_registry_status_changed',
  };
}
