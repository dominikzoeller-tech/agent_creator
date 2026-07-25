/* Legacy CMT compatibility module: cmt-secure-master-live-provider-gate.ts. */
export function makeCompatStub(name: string): any {
  return new Proxy(function compatStub(..._args: any[]) {
    return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
  }, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
      if (prop === Symbol.toPrimitive) return () => name;
      if (prop === 'length') return 0;
      return makeCompatStub(name + '.' + String(prop));
    },
    apply() {
      return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
    }
  });
}

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

export type SecureMasterCommitteeResult = any;
export type SecureMasterCommitteeDemo = any;
export type SecureMasterAppEntry = any;
export type SecureMasterNavStatus = any;
export type SecureMasterAnswerLogEntry = any;
export type SecureMasterAnswerLogStatus = any;
export type SecureMasterAnswerLogList = any;
export type SecureMasterAnswerLogBrowserStore = any;
export type SecureMasterAnswerLogListBrowserStore = any;
export type PrivacyDecisionOption = any;
export type CmtPrivacyDecision = any;
export type SecureMasterProviderAdapterContract = any;
export type SecureMasterProviderAuditEnvelope = any;
export type SecureMasterProviderAuditHistoryItem = any;
export const getSecureMasterAppEntry: any = makeCompatStub('getSecureMasterAppEntry');
export const getSecureMasterNavStatus: any = makeCompatStub('getSecureMasterNavStatus');
export const getSecureMasterCommittee: any = makeCompatStub('getSecureMasterCommittee');
export const getSecureMasterCommitteeDemo: any = makeCompatStub('getSecureMasterCommitteeDemo');
export const createSecureMasterCommittee: any = makeCompatStub('createSecureMasterCommittee');
export const getSecureMasterGuide: any = makeCompatStub('getSecureMasterGuide');
export const getSecureMasterStatus: any = makeCompatStub('getSecureMasterStatus');
export const getSecureMasterAnswerLogEntry: any = makeCompatStub('getSecureMasterAnswerLogEntry');
export const getSecureMasterAnswerLogStatus: any = makeCompatStub('getSecureMasterAnswerLogStatus');
export const getSecureMasterAnswerLogList: any = makeCompatStub('getSecureMasterAnswerLogList');
export const getSecureMasterAnswerLogBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogBrowserStore');
export const getSecureMasterAnswerLogBrowserStoreEntry: any = makeCompatStub('getSecureMasterAnswerLogBrowserStoreEntry');
export const getSecureMasterAnswerLogListBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStore');
export const getSecureMasterAnswerLogListBrowserStoreEntry: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStoreEntry');
export const getPrivacyGateDemo: any = makeCompatStub('getPrivacyGateDemo');
export const evaluatePrivacyGate: any = makeCompatStub('evaluatePrivacyGate');
export const evaluateCmtPrivacyGate: any = makeCompatStub('evaluateCmtPrivacyGate');
export const sanitizeForLocalPreview: any = makeCompatStub('sanitizeForLocalPreview');
export const decidePrivacyAction: any = makeCompatStub('decidePrivacyAction');
export const getPrivacyDecisionDemo: any = makeCompatStub('getPrivacyDecisionDemo');
export const isPrivacyDecisionOption: any = makeCompatStub('isPrivacyDecisionOption');
export const getPrivacyDecisionLabel: any = makeCompatStub('getPrivacyDecisionLabel');
export const createSecureMasterProviderAdapterContract: any = makeCompatStub('createSecureMasterProviderAdapterContract');
export const createSecureMasterProviderAuditEnvelope: any = makeCompatStub('createSecureMasterProviderAuditEnvelope');
export const createProviderAuditEnvelope: any = makeCompatStub('createProviderAuditEnvelope');
export const createProviderAuditHistoryItem: any = makeCompatStub('createProviderAuditHistoryItem');
export default makeCompatStub('default:cmt-secure-master-live-provider-gate.ts');
