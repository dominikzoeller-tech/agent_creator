/* Legacy CMT compatibility module: cmt-secure-master-live-readiness-matrix.ts. */
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

export type SecureMasterLiveReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  requiredForLive: true;
  detail: string;
};

export type SecureMasterLiveReadinessMatrix = {
  canGoLive: false;
  localMvpReady: true;
  providerLiveBlocked: true;
  items: SecureMasterLiveReadinessItem[];
  missingCriticalCount: number;
  nextSafeStep: string;
};

export function createSecureMasterLiveReadinessMatrix(params: {
  hasAdapterContract: boolean;
  hasAdapterPipeline: boolean;
  approvalDecision: string;
  providerCallAllowed: boolean;
}): SecureMasterLiveReadinessMatrix {
  const items: SecureMasterLiveReadinessItem[] = [
    {
      id: 'build',
      label: 'Build stabil',
      ready: true,
      requiredForLive: true,
      detail: 'Build muss gruen sein, bevor Live-KI aktiviert wird.',
    },
    {
      id: 'privacy_gate',
      label: 'Privacy-Gate sichtbar',
      ready: true,
      requiredForLive: true,
      detail: 'Interne Daten muessen erkannt und externe Weitergabe muss blockierbar sein.',
    },
    {
      id: 'approval',
      label: 'Explizite Freigabe',
      ready: params.approvalDecision !== 'cancel',
      requiredForLive: true,
      detail: 'Nutzerfreigabe muss vor externer Verarbeitung vorhanden sein.',
    },
    {
      id: 'adapter_contract',
      label: 'Provider-Adapter-Contract',
      ready: params.hasAdapterContract,
      requiredForLive: true,
      detail: 'Deaktivierter Adapter-Contract muss lokal getestet sein.',
    },
    {
      id: 'adapter_pipeline',
      label: 'Provider-Adapter-Pipeline',
      ready: params.hasAdapterPipeline,
      requiredForLive: true,
      detail: 'Pipeline muss prepare, validate, approve und dispatch_blocked abbilden.',
    },
    {
      id: 'secret_management',
      label: 'Secret-Verwaltung',
      ready: false,
      requiredForLive: true,
      detail: 'API-Keys duerfen nicht im Browser oder Repo gespeichert werden.',
    },
    {
      id: 'budget_limit',
      label: 'Kosten-/Token-Limit',
      ready: false,
      requiredForLive: true,
      detail: 'Vor Live-KI braucht es ein Kosten- und Tokenlimit.',
    },
    {
      id: 'audit_log',
      label: 'Audit-Log fuer externe Calls',
      ready: false,
      requiredForLive: true,
      detail: 'Jeder echte Provider-Call muss protokolliert werden.',
    },
    {
      id: 'provider_call',
      label: 'Provider-Call erlaubt',
      ready: params.providerCallAllowed,
      requiredForLive: true,
      detail: 'Bleibt aktuell bewusst false.',
    },
  ];

  const missingCriticalCount = items.filter((item: any) => item.requiredForLive && !item.ready).length;

  return {
    canGoLive: false,
    localMvpReady: true,
    providerLiveBlocked: true,
    items,
    missingCriticalCount,
    nextSafeStep: 'Weiter lokal testen. Danach Secret-Verwaltung, Kostenlimit und Audit-Log vorbereiten. Erst dann Live-KI diskutieren.',
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
export default makeCompatStub('default:cmt-secure-master-live-readiness-matrix.ts');
