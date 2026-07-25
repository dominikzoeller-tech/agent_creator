export type SecureMasterProviderAdapterDryRun = {
  adapterPrepared: true;
  dryRunOnly: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  providerName: 'none';
  modelName: 'none';
  requestPreview: {
    inputPreview: string;
    approvalDecision: string;
    privacyMode: string;
    purpose: string;
  };
  safetyEnvelope: {
    externalSharingAllowed: false;
    secretsIncluded: false;
    anonymizationRequired: boolean;
    auditRequired: true;
  };
  responsePreview: {
    simulatedStatus: 'blocked_dry_run';
    simulatedMessage: string;
  };
  nextStep: string;
};

export function createSecureMasterProviderAdapterDryRun(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAdapterDryRun {
  const inputPreview = params.input.trim().slice(0, 220) || 'Keine Eingabe';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const anonymizationRequired = privacy !== 'allow_local_only' || params.approvalDecision === 'anonymize_then_send';

  return {
    adapterPrepared: true,
    dryRunOnly: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    providerName: 'none',
    modelName: 'none',
    requestPreview: {
      inputPreview,
      approvalDecision: params.approvalDecision,
      privacyMode: privacy,
      purpose: 'Spaeteren Provider-Aufruf lokal simulieren, ohne externe Sendung.',
    },
    safetyEnvelope: {
      externalSharingAllowed: false,
      secretsIncluded: false,
      anonymizationRequired,
      auditRequired: true,
    },
    responsePreview: {
      simulatedStatus: 'blocked_dry_run',
      simulatedMessage: 'Adapter-Dry-Run erstellt. Dispatch bleibt blockiert, Provider wird nicht aufgerufen.',
    },
    nextStep: 'Naechster Schritt: echten Provider-Adapter nur als deaktivierten Codepfad vorbereiten und erst nach Freigabe aktivierbar machen.',
  };
}
