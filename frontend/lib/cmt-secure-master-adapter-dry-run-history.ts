export type SecureMasterAdapterDryRunHistoryItem = {
  id: string;
  createdAt: string;
  inputPreview: string;
  approvalDecision: string;
  privacyMode: string;
  adapterPrepared: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  anonymizationRequired: boolean;
  simulatedMessage: string;
  nextStep: string;
};

export const SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY = 'cmt.secureMaster.adapterDryRun.history.v1';

export function createAdapterDryRunHistoryItem(result: any): SecureMasterAdapterDryRunHistoryItem {
  return {
    id: 'adapter_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    inputPreview: result?.requestPreview?.inputPreview ?? 'Keine Eingabe',
    approvalDecision: result?.requestPreview?.approvalDecision ?? 'local_only',
    privacyMode: result?.requestPreview?.privacyMode ?? 'allow_local_only',
    adapterPrepared: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    anonymizationRequired: Boolean(result?.safetyEnvelope?.anonymizationRequired),
    simulatedMessage: result?.responsePreview?.simulatedMessage ?? 'Adapter-Dry-Run blockiert.',
    nextStep: result?.nextStep ?? 'Adapter weiter lokal testen.',
  };
}
