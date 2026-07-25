export type SecureMasterProviderAuditHistoryItem = {
  id: string;
  createdAt: string;
  requestId: string;
  approvalDecision: string;
  privacyDecision: string;
  inputPreview: string;
  dispatchStatus: string;
  providerCallAllowed: false;
  secretsIncluded: false;
};

export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY = 'cmt.secureMaster.providerAudit.history.v1';

export function createProviderAuditHistoryItem(envelope: any): SecureMasterProviderAuditHistoryItem {
  return {
    id: 'audit_hist_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    requestId: envelope?.requestId ?? 'unknown',
    approvalDecision: envelope?.approvalDecision ?? 'local_only',
    privacyDecision: envelope?.privacyDecision ?? 'allow_local_only',
    inputPreview: envelope?.inputPreview ?? 'Keine Eingabe',
    dispatchStatus: envelope?.dispatchStatus ?? 'blocked_before_provider_call',
    providerCallAllowed: false,
    secretsIncluded: false,
  };
}
