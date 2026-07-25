export type SecureMasterProviderAdapterContract = {
  contractPrepared: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  dryRunOnly: true;
  selectedProvider: 'none';
  selectedModel: 'none';
  requestEnvelopePreview: {
    inputPreview: string;
    approvalDecision: string;
    privacyDecision: string;
    purpose: string;
    secretsIncluded: false;
  };
  responseEnvelopePreview: {
    status: 'blocked_dry_run';
    message: string;
    providerResponseIncluded: false;
  };
  activationRequirements: string[];
  nextStep: string;
};

export function createSecureMasterProviderAdapterContract(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAdapterContract {
  return {
    contractPrepared: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    dryRunOnly: true,
    selectedProvider: 'none',
    selectedModel: 'none',
    requestEnvelopePreview: {
      inputPreview: params.input.trim().slice(0, 240) || 'Keine Eingabe',
      approvalDecision: params.approvalDecision,
      privacyDecision: params.privacyDecision ?? 'allow_local_only',
      purpose: 'Deaktivierten Provider-Adapter lokal vorbereiten, ohne externe Anfrage.',
      secretsIncluded: false,
    },
    responseEnvelopePreview: {
      status: 'blocked_dry_run',
      message: 'Provider-Adapter-Contract erstellt. Dispatch und Provider-Call bleiben blockiert.',
      providerResponseIncluded: false,
    },
    activationRequirements: [
      'Build muss gruen sein',
      'Provider-Konfiguration muss validiert sein',
      'Secret-Verwaltung muss aktiv sein',
      'Kosten-/Token-Limit muss gesetzt sein',
      'Privacy-Gate muss externe Verarbeitung erlauben',
      'Explizite Nutzerfreigabe muss vorliegen',
      'Audit-Log muss fuer jeden externen Call geschrieben werden',
    ],
    nextStep: 'Danach: echten Adapter nur als deaktivierten Codepfad einbauen. Live-Schalter bleibt weiterhin aus.',
  };
}
