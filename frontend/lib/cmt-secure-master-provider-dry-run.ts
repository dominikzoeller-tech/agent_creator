export type SecureMasterProviderDryRunMode = 'local_answer' | 'provider_dry_run';

export type SecureMasterProviderDryRunResult = {
  mode: SecureMasterProviderDryRunMode;
  dryRunOnly: true;
  providerCallAllowed: false;
  providerName: 'none';
  modelName: 'none';
  simulatedLatencyMs: number;
  simulatedAnswer: string;
  blockedReason: string;
  nextStep: string;
};

export function createSecureMasterProviderDryRun(input: string, approvalDecision: string): SecureMasterProviderDryRunResult {
  const text = input.trim();
  const base = text.length > 0 ? text.slice(0, 180) : 'Keine Eingabe';

  return {
    mode: 'provider_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    providerName: 'none',
    modelName: 'none',
    simulatedLatencyMs: 0,
    simulatedAnswer: 'Provider-Dry-Run: Es würde jetzt eine Modellantwort vorbereitet, aber nicht gesendet. Eingabe-Vorschau: ' + base + '. Lokale Freigabe: ' + approvalDecision + '.',
    blockedReason: 'Echter Provider-Call ist blockiert: kein API-Key, kein aktivierter Provider, keine externe Freigabe, kein Live-Schalter.',
    nextStep: 'Als Nächstes Provider-Dry-Run in das Antwort-Log übernehmen und danach erst einen echten Provider-Adapter vorbereiten.',
  };
}
