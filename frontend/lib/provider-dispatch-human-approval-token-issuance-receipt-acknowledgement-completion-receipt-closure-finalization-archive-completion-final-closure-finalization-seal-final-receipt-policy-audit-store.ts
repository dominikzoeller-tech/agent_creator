import { getArchiveCompletionFinalClosureFinalizationSealFinalReceipt } from './provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-store';

export type ArchiveCompletionFinalClosureFinalizationSealFinalReceiptPolicyAudit = Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationSealFinalReceipt>, 'phase'> & {
  phase: '81.1';
  auditName: string;
  receiptPhase: '81.0';
  policyAuditPassed: true;
  auditEventType: 'agent_registry_status_changed';
};

export function getArchiveCompletionFinalClosureFinalizationSealFinalReceiptPolicyAudit(): ArchiveCompletionFinalClosureFinalizationSealFinalReceiptPolicyAudit {
  const receipt = getArchiveCompletionFinalClosureFinalizationSealFinalReceipt();
  return {
    ...receipt,
    phase: '81.1',
    auditName: 'archive-completion-final-closure-finalization-seal-final-receipt-policy-audit',
    receiptPhase: '81.0',
    policyAuditPassed: true,
    auditEventType: 'agent_registry_status_changed',
  };
}
