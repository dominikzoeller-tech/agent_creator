export type SecureMasterServerProviderConfigPreview = {
  serverConfigPrepared: true;
  providerEnabled: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  dryRunOnly: true;
  envExamplePresent: true;
  clientCanReadSecrets: false;
  requiredEnvKeys: string[];
  forbiddenClientKeys: string[];
  nextSafeStep: string;
};

export const secureMasterServerProviderConfigPreview: SecureMasterServerProviderConfigPreview = {
  serverConfigPrepared: true,
  providerEnabled: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  dryRunOnly: true,
  envExamplePresent: true,
  clientCanReadSecrets: false,
  requiredEnvKeys: [
    'PROVIDER_ENABLED',
    'PROVIDER_NAME',
    'PROVIDER_MODEL',
    'PROVIDER_API_KEY',
    'PROVIDER_DRY_RUN_ONLY',
    'EXTERNAL_SHARING_ALLOWED',
    'LIVE_MODEL_ENABLED',
  ],
  forbiddenClientKeys: [
    'PROVIDER_API_KEY',
    'PROVIDER_BASE_URL with secret query params',
    'any token or credential value',
  ],
  nextSafeStep: 'Als naechstes serverseitigen Provider-Adapter als blockierten Dry-Run-Endpunkt vorbereiten. Noch keine echten Secrets verwenden.',
};
