/* Legacy CMT compatibility module: cmt-secure-master-env-preflight.ts. */
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

export type SecureMasterEnvPreflight = {
  envPreflightPrepared: true;
  realSecretsAllowedNow: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  requiredFilesLater: string[];
  gitIgnorePatternsRequired: string[];
  checks: { id: string; label: string; status: 'prepared' | 'blocked'; detail: string }[];
  nextSafeStep: string;
};

export const secureMasterEnvPreflight: SecureMasterEnvPreflight = {
  envPreflightPrepared: true,
  realSecretsAllowedNow: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredFilesLater: ['.env.local', '.gitignore', 'server-side provider config'],
  gitIgnorePatternsRequired: ['.env', '.env.*', '!.env.example', '*.key', '*secret*'],
  checks: [
    { id: 'no_real_keys', label: 'Keine echten API-Keys im UI', status: 'blocked', detail: 'Echte API-Keys duerfen aktuell nicht eingegeben werden.' },
    { id: 'no_browser_secret', label: 'Keine Secrets in localStorage', status: 'blocked', detail: 'Browser-Speicherung echter Secrets bleibt verboten.' },
    { id: 'gitignore', label: '.gitignore muss Secrets ausschliessen', status: 'prepared', detail: 'Vor Live-KI muss .gitignore auf .env und Secret-Dateien geprueft werden.' },
    { id: 'env_example', label: '.env.example spaeter erlaubt', status: 'prepared', detail: 'Nur Platzhalter ohne echte Werte duerfen versioniert werden.' },
    { id: 'server_only', label: 'Provider-Key nur serverseitig', status: 'prepared', detail: 'Ein echter Provider-Key darf spaeter nur serverseitig gelesen werden.' },
  ],
  nextSafeStep: 'Als naechstes .env.example und serverseitigen Config-Stub vorbereiten. Keine echten Secrets eintragen.',
};

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
export default makeCompatStub('default:cmt-secure-master-env-preflight.ts');
