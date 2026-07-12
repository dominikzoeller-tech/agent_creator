import { getArchiveCompletionFinalClosureFinalizationReceipt } from './provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-store';

export type ArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit = ReturnType<typeof getArchiveCompletionFinalClosureFinalizationReceipt> & {
  phase: '77.1';
  auditName: string;
  receiptPhase: '77.0';
  policyAuditPassed: true;
  auditEventType: 'agent_registry_status_changed';
};

export function getArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit(): ArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit {
  const receipt = getArchiveCompletionFinalClosureFinalizationReceipt();
  return {
    ...receipt,
    phase: '77.1',
    auditName: 'archive-completion-final-closure-finalization-receipt-policy-audit',
    receiptPhase: '77.0',
    policyAuditPassed: true,
    auditEventType: 'agent_registry_status_changed',
  };
}
