export type SecureMasterProviderConfig = {
  providerConfigPrepared: true;
  providerEnabled: false;
  selectedProvider: 'none';
  selectedModel: 'none';
  liveModelEnabled: false;
  internetEnabled: false;
  externalSharingAllowed: false;
  envKeysRequiredLater: string[];
  supportedProvidersLater: string[];
  activationBlockedReason: string;
  nextStep: string;
};

export const secureMasterProviderConfig: SecureMasterProviderConfig = {
  providerConfigPrepared: true,
  providerEnabled: false,
  selectedProvider: 'none',
  selectedModel: 'none',
  liveModelEnabled: false,
  internetEnabled: false,
  externalSharingAllowed: false,
  envKeysRequiredLater: ['PROVIDER_NAME', 'MODEL_NAME', 'PROVIDER_API_KEY'],
  supportedProvidersLater: ['Azure OpenAI', 'OpenAI-compatible endpoint', 'Local model later'],
  activationBlockedReason: 'Live-KI bleibt gesperrt, bis Build stabil, Privacy-Gate bestätigt, Freigabe-Flow sichtbar und Kosten-/Token-Limit definiert sind.',
  nextStep: 'Als Nächstes Provider-Setup-Form vorbereiten, aber Werte noch nicht speichern und keinen Provider aufrufen.',
};
