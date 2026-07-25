export type SecureMasterProviderAuditEnvelope = {
  auditPrepared: true;
  providerCallAllowed: false;
  externalSharingAllowed: false;
  liveModelEnabled: false;
  secretsIncluded: false;
  createdAt: string;
  requestId: string;
  approvalDecision: string;
  privacyDecision: string;
  inputPreview: string;
  providerName: 'none';
  modelName: 'none';
  dispatchStatus: 'blocked_before_provider_call';
  requiredAuditFieldsLater: string[];
  redactionRules: string[];
  nextSafeStep: string;
};

export function createSecureMasterProviderAuditEnvelope(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAuditEnvelope {
  return {
    auditPrepared: true,
    providerCallAllowed: false,
    externalSharingAllowed: false,
    liveModelEnabled: false,
    secretsIncluded: false,
    createdAt: new Date().toISOString(),
    requestId: 'audit_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    approvalDecision: params.approvalDecision,
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    inputPreview: params.input.trim().slice(0, 220) || 'Keine Eingabe',
    providerName: 'none',
    modelName: 'none',
    dispatchStatus: 'blocked_before_provider_call',
    requiredAuditFieldsLater: [
      'requestId',
      'createdAt',
      'approvalDecision',
      'privacyDecision',
      'providerName',
      'modelName',
      'tokenBudget',
      'redactionApplied',
      'dispatchStatus',
      'providerResponseStatus',
    ],
    redactionRules: [
      'keine API-Keys protokollieren',
      'keine vollstaendigen personenbezogenen Daten protokollieren',
      'nur gekuerzte inputPreview speichern',
      'interne Daten vor externer Nutzung anonymisieren',
      'Provider-Response spaeter nur ohne Secrets speichern',
    ],
    nextSafeStep: 'Als naechstes lokalen Audit-Verlauf vorbereiten. Danach erst Provider-Adapter weiter verdichten.',
  };
}
