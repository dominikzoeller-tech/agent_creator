/* Legacy CMT compatibility module: cmt-secure-master-provider-adapter-contract.ts. */
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

export type SecureMasterProviderAdapterContract = {
  contractPrepared: true;
  adapterName: 'secure-master-provider-adapter';
  adapterDispatchAllowed: false;
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  secretsIncluded: false;
  selectedProvider: string;
  selectedModel: string;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  requestEnvelopePreview: {
    dryRunOnly: true;
    providerCallAllowed: false;
    secretsIncluded: false;
    inputPreview: string;
    approvalDecision: string;
    privacyDecision: string;
    selectedProvider: string;
    selectedModel: string;
  };
  responseEnvelopePreview: {
    ok: true;
    message: string;
    dispatchStatus: 'blocked_dry_run';
    providerCallAllowed: false;
    adapterDispatchAllowed: false;
    dryRunOnly: true;
  };
  activationRequirements: string[];
  requiredEnvLater: string[];
  forbiddenClientFields: string[];
  blockedReason: string;
  nextStep: string;
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterContract(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
  selectedProvider?: string;
  selectedModel?: string;
} = {}): SecureMasterProviderAdapterContract {
  const inputPreview = String(params.input ?? '').slice(0, 240);
  const approvalDecision = params.approvalDecision ?? 'local_only';
  const privacyDecision = params.privacyDecision ?? 'allow_local_only';
  const selectedProvider = params.selectedProvider ?? 'none';
  const selectedModel = params.selectedModel ?? 'none';
  const activationRequirements = [
    'Build muss gruen sein',
    'Worker-Ergebnis muss geladen sein',
    'Provider-Key darf nur serverseitig existieren',
    'Keine Secrets im Client oder localStorage',
    'Externe Verarbeitung nur nach expliziter Freigabe',
    'Dry-Run bleibt Default',
  ];
  const nextStep = 'Build gruen bekommen, Worker-Ergebnis laden, dann Agent-Arbeitsmodus weiter nutzen.';

  return {
    contractPrepared: true,
    adapterName: 'secure-master-provider-adapter',
    adapterDispatchAllowed: false,
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    secretsIncluded: false,
    selectedProvider,
    selectedModel,
    inputPreview,
    approvalDecision,
    privacyDecision,
    requestEnvelopePreview: {
      dryRunOnly: true,
      providerCallAllowed: false,
      secretsIncluded: false,
      inputPreview,
      approvalDecision,
      privacyDecision,
      selectedProvider,
      selectedModel,
    },
    responseEnvelopePreview: {
      ok: true,
      message: 'Provider-Adapter ist nur als Dry-Run vorbereitet. Kein externer Call.',
      dispatchStatus: 'blocked_dry_run',
      providerCallAllowed: false,
      adapterDispatchAllowed: false,
      dryRunOnly: true,
    },
    activationRequirements,
    requiredEnvLater: [
      'LIVE_TEST_ENABLED',
      'PROVIDER_ENABLED',
      'LIVE_MODEL_ENABLED',
      'EXTERNAL_SHARING_ALLOWED',
      'PROVIDER_MODEL',
      'PROVIDER_API_KEY',
    ],
    forbiddenClientFields: [
      'PROVIDER_API_KEY',
      'apiKey',
      'secret',
      'token',
      'password',
      'rawProviderCredential',
    ],
    blockedReason: 'Provider-Adapter-Contract ist vorbereitet, echter Provider-Call bleibt blockiert.',
    nextStep,
    nextSafeStep: nextStep,
  };
}

export default createSecureMasterProviderAdapterContract;

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
export const createSecureMasterProviderAuditEnvelope: any = makeCompatStub('createSecureMasterProviderAuditEnvelope');
export const createProviderAuditEnvelope: any = makeCompatStub('createProviderAuditEnvelope');
export const createProviderAuditHistoryItem: any = makeCompatStub('createProviderAuditHistoryItem');
