export type SecureMasterLiveProviderGate = {
  liveTestEnabled: boolean;
  providerEnabled: boolean;
  liveModelEnabled: boolean;
  externalSharingAllowed: boolean;
  providerName: string;
  modelName: string;
  hasApiKey: boolean;
  providerCallAllowed: boolean;
  blockedReasons: string[];
};

export type SecureMasterLiveProviderResponse = {
  ok: boolean;
  liveProviderPathPrepared: true;
  providerCallAttempted: boolean;
  providerCallAllowed: boolean;
  gate: SecureMasterLiveProviderGate;
  answer?: string;
  blockedReasons?: string[];
  error?: string;
};

const sensitiveTerms = [
  'kundendaten', 'kunde ', 'intern', 'vertraulich', 'geheim', 'passwort', 'api key', 'token', 'iban', 'personenbezogen', 'rechnung', 'vertrag', 'mitarbeiter'
];

export function containsSensitiveTerms(input: string) {
  const value = input.toLowerCase();
  return sensitiveTerms.filter((term) => value.includes(term));
}

export function createLiveProviderGate(input: string): SecureMasterLiveProviderGate {
  const blockedReasons: string[] = [];
  const liveTestEnabled = process.env.LIVE_TEST_ENABLED === 'true';
  const providerEnabled = process.env.PROVIDER_ENABLED === 'true';
  const liveModelEnabled = process.env.LIVE_MODEL_ENABLED === 'true';
  const externalSharingAllowed = process.env.EXTERNAL_SHARING_ALLOWED === 'true';
  const providerName = process.env.PROVIDER_NAME || 'none';
  const modelName = process.env.PROVIDER_MODEL || process.env.MODEL_NAME || 'none';
  const hasApiKey = Boolean(process.env.PROVIDER_API_KEY);
  const sensitiveMatches = containsSensitiveTerms(input);

  if (!liveTestEnabled) blockedReasons.push('LIVE_TEST_ENABLED ist nicht true.');
  if (!providerEnabled) blockedReasons.push('PROVIDER_ENABLED ist nicht true.');
  if (!liveModelEnabled) blockedReasons.push('LIVE_MODEL_ENABLED ist nicht true.');
  if (!externalSharingAllowed) blockedReasons.push('EXTERNAL_SHARING_ALLOWED ist nicht true.');
  if (!hasApiKey) blockedReasons.push('PROVIDER_API_KEY fehlt serverseitig.');
  if (!modelName || modelName === 'none') blockedReasons.push('PROVIDER_MODEL/MODEL_NAME fehlt.');
  if (sensitiveMatches.length > 0) blockedReasons.push('Testfrage enthaelt blockierte sensible Begriffe: ' + sensitiveMatches.join(', '));
  if (input.trim().length === 0) blockedReasons.push('Testfrage fehlt.');
  if (input.length > 500) blockedReasons.push('Testfrage ist zu lang fuer den ersten Live-Test.');

  return {
    liveTestEnabled,
    providerEnabled,
    liveModelEnabled,
    externalSharingAllowed,
    providerName,
    modelName,
    hasApiKey,
    providerCallAllowed: blockedReasons.length === 0,
    blockedReasons,
  };
}

export function buildSafeLiveTestPrompt(input: string) {
  return [
    { role: 'system', content: 'Du bist ein sicherer Test-Assistent. Antworte kurz. Verarbeite keine internen, personenbezogenen oder geheimen Daten.' },
    { role: 'user', content: input.slice(0, 500) },
  ];
}
