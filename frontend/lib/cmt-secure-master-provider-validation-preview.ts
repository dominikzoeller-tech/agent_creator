export type SecureMasterProviderValidationPreview = {
  validationPrepared: true;
  canValidateShape: true;
  canValidateApproval: true;
  canValidatePrivacyState: true;
  canValidateBudgetLimit: true;
  canPersistSecrets: false;
  canCallProvider: false;
  liveActivationAllowed: false;
  rules: string[];
  blockerSummary: string;
  nextStep: string;
};

export const secureMasterProviderValidationPreview: SecureMasterProviderValidationPreview = {
  validationPrepared: true,
  canValidateShape: true,
  canValidateApproval: true,
  canValidatePrivacyState: true,
  canValidateBudgetLimit: true,
  canPersistSecrets: false,
  canCallProvider: false,
  liveActivationAllowed: false,
  rules: [
    'Provider darf nicht none sein',
    'Model darf nicht none sein',
    'API-Key wird später nur über sichere Secret-Verwaltung akzeptiert',
    'Interne Daten erfordern Anonymisierung oder Freigabe',
    'Budget-/Token-Limit muss gesetzt sein',
    'Audit-Log muss aktiv sein',
    'Live-Schalter darf erst nach expliziter Freigabe aktiviert werden',
  ],
  blockerSummary: 'Live-KI ist weiterhin blockiert. Validierung ist nur vorbereitet und führt keinen Provider-Call aus.',
  nextStep: 'Als Nächstes eine echte Freigabeentscheidung im lokalen UI vorbereiten: local_only, anonymize_then_send oder cancel.',
};
