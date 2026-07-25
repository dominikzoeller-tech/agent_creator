/* Legacy CMT compatibility module: cmt-secure-master-secret-preflight-check.ts. */
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

export type SecureMasterSecretPreflightResult = {
  ok: boolean;
  checkedAt: string;
  realSecretsRead: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreCoversEnv: boolean;
  gitIgnoreCoversKeys: boolean;
  requiredBeforeLive: string[];
  warnings: string[];
  nextSafeStep: string;
};

export function createSecureMasterSecretPreflightResult(params: {
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreText: string;
}): SecureMasterSecretPreflightResult {
  const gitIgnoreText = params.gitIgnoreText.toLowerCase();
  const gitIgnoreCoversEnv = gitIgnoreText.includes('.env') || gitIgnoreText.includes('.env.*');
  const gitIgnoreCoversKeys = gitIgnoreText.includes('*.key') || gitIgnoreText.includes('secret') || gitIgnoreText.includes('*secret*');
  const warnings: string[] = [];

  if (!params.envExampleExists) warnings.push('.env.example fehlt oder ist nicht lesbar.');
  if (!params.gitIgnoreExists) warnings.push('.gitignore fehlt oder ist nicht lesbar.');
  if (!gitIgnoreCoversEnv) warnings.push('.gitignore deckt .env-Dateien noch nicht eindeutig ab.');
  if (!gitIgnoreCoversKeys) warnings.push('.gitignore deckt Key-/Secret-Dateien noch nicht eindeutig ab.');

  return {
    ok: warnings.length === 0,
    checkedAt: new Date().toISOString(),
    realSecretsRead: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    envExampleExists: params.envExampleExists,
    gitIgnoreExists: params.gitIgnoreExists,
    gitIgnoreCoversEnv,
    gitIgnoreCoversKeys,
    requiredBeforeLive: [
      '.env.example ohne echte Werte vorhanden',
      '.gitignore blockiert .env und Secret-Dateien',
      'echte API-Keys nur serverseitig und nie im Client',
      'keine echten Secrets im Repo',
      'Provider bleibt deaktiviert bis manueller Live-Test-Schalter aktiv ist',
    ],
    warnings,
    nextSafeStep: warnings.length === 0
      ? 'Secret/Git-Preflight ist lokal gruener. Als naechstes Budget-/Token-Limit vorbereiten.'
      : 'Warnungen beheben, bevor ein Live-Test-Schalter vorbereitet wird.',
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
export default makeCompatStub('default:cmt-secure-master-secret-preflight-check.ts');
