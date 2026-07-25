export type SecureMasterDryRunHistoryItem = {
  id: string;
  createdAt: string;
  inputPreview: string;
  approvalDecision: string;
  mode: string;
  dryRunOnly: true;
  providerCallAllowed: false;
  simulatedAnswer: string;
  blockedReason: string;
};

export const SECURE_MASTER_DRY_RUN_HISTORY_KEY = 'cmt.secureMaster.providerDryRun.history.v1';

export function createDryRunHistoryItem(result: any, input: string, approvalDecision: string): SecureMasterDryRunHistoryItem {
  return {
    id: 'dry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    inputPreview: input.trim().slice(0, 180),
    approvalDecision,
    mode: result?.mode ?? 'provider_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    simulatedAnswer: result?.simulatedAnswer ?? 'Provider-Dry-Run ohne Ergebnis.',
    blockedReason: result?.blockedReason ?? 'Provider-Call blockiert.',
  };
}
