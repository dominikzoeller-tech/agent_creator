/* Legacy CMT compatibility module: cmt-secure-master-live-preflight.ts. */
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
export default makeCompatStub('default:cmt-secure-master-live-preflight.ts');
