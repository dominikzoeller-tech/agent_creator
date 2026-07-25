export type SecureMasterBudgetPreflightResult = {
  ok: boolean;
  checkedAt: string;
  providerCallAllowed: false;
  liveModelEnabled: false;
  budgetLimitPrepared: true;
  maxTokensPerRequest: number;
  maxRequestsPerSession: number;
  maxEstimatedCostPerSessionEur: number;
  timeoutMs: number;
  hardStopEnabled: true;
  warnings: string[];
  requiredBeforeLive: string[];
  nextSafeStep: string;
};

export function createSecureMasterBudgetPreflightResult(): SecureMasterBudgetPreflightResult {
  const maxTokensPerRequest = 1000;
  const maxRequestsPerSession = 10;
  const maxEstimatedCostPerSessionEur = 1;
  const timeoutMs = 30000;
  const warnings: string[] = [];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    providerCallAllowed: false,
    liveModelEnabled: false,
    budgetLimitPrepared: true,
    maxTokensPerRequest,
    maxRequestsPerSession,
    maxEstimatedCostPerSessionEur,
    timeoutMs,
    hardStopEnabled: true,
    warnings,
    requiredBeforeLive: [
      'maxTokensPerRequest muss gesetzt sein',
      'maxRequestsPerSession muss gesetzt sein',
      'maxEstimatedCostPerSessionEur muss gesetzt sein',
      'timeoutMs muss gesetzt sein',
      'Hard-Stop muss aktiv sein',
      'Audit-Log muss jeden echten Provider-Call protokollieren',
    ],
    nextSafeStep: 'Budget-/Token-Limit ist vorbereitet. Als naechstes manuellen Live-Test-Schalter bauen, aber standardmaessig deaktiviert lassen.',
  };
}
