export type SecureMasterLivePreflightResult = {
  ok: boolean;
  checkedAt: string;
  liveTestPrepared: true;
  canAttemptLiveProviderCall: boolean;
  providerCallAllowed: boolean;
  clientSecretsAllowed: false;
  serverSideSecretsRequired: true;
  env: {
    LIVE_TEST_ENABLED: boolean;
    PROVIDER_ENABLED: boolean;
    LIVE_MODEL_ENABLED: boolean;
    EXTERNAL_SHARING_ALLOWED: boolean;
    PROVIDER_API_KEY_PRESENT: boolean;
    PROVIDER_MODEL_PRESENT: boolean;
    PROVIDER_BASE_URL_PRESENT: boolean;
  };
  blockedReasons: string[];
  safeTestQuestion: string;
  nextStep: string;
};

export function createSecureMasterLivePreflightResult(): SecureMasterLivePreflightResult {
  const env = {
    LIVE_TEST_ENABLED: process.env.LIVE_TEST_ENABLED === 'true',
    PROVIDER_ENABLED: process.env.PROVIDER_ENABLED === 'true',
    LIVE_MODEL_ENABLED: process.env.LIVE_MODEL_ENABLED === 'true',
    EXTERNAL_SHARING_ALLOWED: process.env.EXTERNAL_SHARING_ALLOWED === 'true',
    PROVIDER_API_KEY_PRESENT: Boolean(process.env.PROVIDER_API_KEY),
    PROVIDER_MODEL_PRESENT: Boolean(process.env.PROVIDER_MODEL || process.env.MODEL_NAME),
    PROVIDER_BASE_URL_PRESENT: Boolean(process.env.PROVIDER_BASE_URL),
  };

  const blockedReasons: string[] = [];
  if (!env.LIVE_TEST_ENABLED) blockedReasons.push('LIVE_TEST_ENABLED ist nicht true.');
  if (!env.PROVIDER_ENABLED) blockedReasons.push('PROVIDER_ENABLED ist nicht true.');
  if (!env.LIVE_MODEL_ENABLED) blockedReasons.push('LIVE_MODEL_ENABLED ist nicht true.');
  if (!env.EXTERNAL_SHARING_ALLOWED) blockedReasons.push('EXTERNAL_SHARING_ALLOWED ist nicht true.');
  if (!env.PROVIDER_API_KEY_PRESENT) blockedReasons.push('PROVIDER_API_KEY fehlt serverseitig.');
  if (!env.PROVIDER_MODEL_PRESENT) blockedReasons.push('PROVIDER_MODEL oder MODEL_NAME fehlt.');

  const canAttemptLiveProviderCall = blockedReasons.length === 0;

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    liveTestPrepared: true,
    canAttemptLiveProviderCall,
    providerCallAllowed: canAttemptLiveProviderCall,
    clientSecretsAllowed: false,
    serverSideSecretsRequired: true,
    env,
    blockedReasons,
    safeTestQuestion: 'Antworte in einem Satz: Funktioniert dieser sichere Live-Test?',
    nextStep: canAttemptLiveProviderCall
      ? 'Alle ENV-Gates sind aktiv. Jetzt nur eine harmlose Testfrage verwenden und keinen internen Inhalt senden.'
      : 'ENV-Gates serverseitig setzen, wenn ein echter Live-Test bewusst freigegeben ist.',
  };
}
