/* Legacy CMT compatibility module: cmt-secure-master-provider-adapter-dry-run.ts. */
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

export type SecureMasterProviderAdapterDryRun = {
  adapterPrepared: true;
  dryRunOnly: true;
  adapterDispatchAllowed: false;
  providerCallAllowed: false;
  providerName: 'none';
  modelName: 'none';
  requestPreview: {
    inputPreview: string;
    approvalDecision: string;
    privacyMode: string;
    purpose: string;
  };
  safetyEnvelope: {
    externalSharingAllowed: false;
    secretsIncluded: false;
    anonymizationRequired: boolean;
    auditRequired: true;
  };
  responsePreview: {
    simulatedStatus: 'blocked_dry_run';
    simulatedMessage: string;
  };
  nextStep: string;
};

export function createSecureMasterProviderAdapterDryRun(params: {
  input: string;
  approvalDecision: string;
  privacyDecision?: string;
}): SecureMasterProviderAdapterDryRun {
  const inputPreview = params.input.trim().slice(0, 220) || 'Keine Eingabe';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const anonymizationRequired = privacy !== 'allow_local_only' || params.approvalDecision === 'anonymize_then_send';

  return {
    adapterPrepared: true,
    dryRunOnly: true,
    adapterDispatchAllowed: false,
    providerCallAllowed: false,
    providerName: 'none',
    modelName: 'none',
    requestPreview: {
      inputPreview,
      approvalDecision: params.approvalDecision,
      privacyMode: privacy,
      purpose: 'Spaeteren Provider-Aufruf lokal simulieren, ohne externe Sendung.',
    },
    safetyEnvelope: {
      externalSharingAllowed: false,
      secretsIncluded: false,
      anonymizationRequired,
      auditRequired: true,
    },
    responsePreview: {
      simulatedStatus: 'blocked_dry_run',
      simulatedMessage: 'Adapter-Dry-Run erstellt. Dispatch bleibt blockiert, Provider wird nicht aufgerufen.',
    },
    nextStep: 'Naechster Schritt: echten Provider-Adapter nur als deaktivierten Codepfad vorbereiten und erst nach Freigabe aktivierbar machen.',
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
export default makeCompatStub('default:cmt-secure-master-provider-adapter-dry-run.ts');
