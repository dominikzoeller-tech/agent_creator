export type SecureMasterProviderSetupPreview = {
  setupFormPrepared: true;
  saveEnabled: false;
  activationEnabled: false;
  noSecretPersistence: true;
  noProviderCall: true;
  fields: string[];
  warning: string;
  nextStep: string;
};

export const secureMasterProviderSetupPreview: SecureMasterProviderSetupPreview = {
  setupFormPrepared: true,
  saveEnabled: false,
  activationEnabled: false,
  noSecretPersistence: true,
  noProviderCall: true,
  fields: ['Provider', 'Model', 'API key placeholder', 'Budget/token limit', 'Approval mode'],
  warning: 'Noch keine echten API-Keys eingeben. Dieses Formular ist nur eine lokale Vorschau. Es speichert nichts und ruft keinen Provider auf.',
  nextStep: 'Als Nächstes Validierung und Freigabe-Check vorbereiten, bevor echte Provider-Werte erlaubt werden.',
};
