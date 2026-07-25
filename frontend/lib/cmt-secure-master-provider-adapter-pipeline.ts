/* Legacy CMT compatibility module: cmt-secure-master-provider-adapter-pipeline.ts. */
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

export type SecureMasterProviderPipelineStage = {
  id: 'prepare' | 'validate' | 'approve' | 'dispatch_blocked';
  label: string;
  status: 'ready' | 'prepared' | 'blocked';
  detail: string;
};

export type SecureMasterProviderAdapterPipeline = {
  pipelinePrepared: true;
  dryRunOnly: true;
  providerCallAllowed: false;
  adapterDispatchAllowed: false;
  currentStage: 'dispatch_blocked';
  stages: SecureMasterProviderPipelineStage[];
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterPipeline(params: {
  approvalDecision: string;
  privacyDecision?: string;
  hasAdapterContract: boolean;
}): SecureMasterProviderAdapterPipeline {
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision;
  const privacyBlocked = privacy !== 'allow_local_only' || approval === 'cancel';

  return {
    pipelinePrepared: true,
    dryRunOnly: true,
    providerCallAllowed: false,
    adapterDispatchAllowed: false,
    currentStage: 'dispatch_blocked',
    stages: [
      {
        id: 'prepare',
        label: 'Adapter vorbereiten',
        status: params.hasAdapterContract ? 'prepared' : 'ready',
        detail: params.hasAdapterContract ? 'Adapter-Contract liegt lokal vor.' : 'Adapter-Contract kann lokal erstellt werden.',
      },
      {
        id: 'validate',
        label: 'Validieren',
        status: 'prepared',
        detail: privacyBlocked ? 'Validierung erkennt Datenschutz-/Freigabegrenze.' : 'Validierung kann lokal simuliert werden.',
      },
      {
        id: 'approve',
        label: 'Freigabe pruefen',
        status: approval === 'local_only' ? 'prepared' : 'blocked',
        detail: approval === 'local_only' ? 'Lokale Freigabe aktiv. Externe Freigabe nicht aktiv.' : 'Externe Freigabe fehlt oder Abbruch gewaehlt.',
      },
      {
        id: 'dispatch_blocked',
        label: 'Dispatch blockiert',
        status: 'blocked',
        detail: 'Provider-Dispatch bleibt blockiert. Kein API-Key, kein Live-Schalter, kein externer Call.',
      },
    ],
    nextSafeStep: 'Als naechstes einen deaktivierten Provider-Adapter-Codepfad mit Tests vorbereiten. Live-Call bleibt aus.',
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
export default makeCompatStub('default:cmt-secure-master-provider-adapter-pipeline.ts');
