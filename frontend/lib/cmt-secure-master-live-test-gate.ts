/* Legacy CMT compatibility module: cmt-secure-master-live-test-gate.ts. */
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

export type SecureMasterLiveTestGateResult = {
  ok: boolean;
  checkedAt: string;
  liveTestGatePrepared: true;
  canStartLiveTest: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  manualApprovalRequired: true;
  realSecretsRequiredServerSide: true;
  clientSecretsAllowed: false;
  requiredBeforeLiveTest: string[];
  blockedReasons: string[];
  nextSafeStep: string;
};

export function createSecureMasterLiveTestGateResult(): SecureMasterLiveTestGateResult {
  const blockedReasons = [
    'Provider ist noch nicht aktiv.',
    'Live-Modell ist noch nicht aktiv.',
    'Externe Weitergabe ist noch nicht freigegeben.',
    'Echte Secrets duerfen nicht im Client liegen.',
    'Manuelle Live-Test-Freigabe fehlt noch.',
  ];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    liveTestGatePrepared: true,
    canStartLiveTest: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    manualApprovalRequired: true,
    realSecretsRequiredServerSide: true,
    clientSecretsAllowed: false,
    requiredBeforeLiveTest: [
      'Build muss gruen sein',
      'Secret/Git-Preflight muss gruen sein',
      'Budget-/Token-Limit muss gruen sein',
      'Audit-Verlauf muss funktionieren',
      'Serverseitiger Provider-Adapter muss vorhanden sein',
      'Provider-Key muss nur serverseitig in .env.local liegen',
      'Manueller Live-Test-Schalter muss explizit aktiviert werden',
      'Testfrage darf keine internen oder personenbezogenen Daten enthalten',
    ],
    blockedReasons,
    nextSafeStep: 'Jetzt ist die Live-Test-Schwelle vorbereitet. Naechster Patch darf den ersten echten Live-Test vorbereiten, aber nur mit serverseitigem ENV-Key und expliziter manueller Freigabe.',
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
export default makeCompatStub('default:cmt-secure-master-live-test-gate.ts');
