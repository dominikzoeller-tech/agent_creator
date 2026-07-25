/* Legacy CMT compatibility module: cmt-secure-master-provider-audit-envelope.ts. */
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

export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY = 'secure_master_provider_audit_history';

export type SecureMasterProviderAuditEnvelope = {
  id: string;
  requestId: string;
  createdAt: string;
  auditPrepared: true;
  dispatchStatus: 'blocked_dry_run' | 'prepared' | 'blocked';
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsIncluded: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  llmCallPerformed: false;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  adapterPrepared: boolean;
  serverDryRunAvailable: boolean;
  providerName: string;
  modelName: string;
  requiredAuditFieldsLater: string[];
  forbiddenAuditFields: string[];
  redactionRules: string[];
  resultSummary: string;
  blockedReason: string;
  nextSafeStep: string;
};

export type SecureMasterProviderAuditHistoryItem = SecureMasterProviderAuditEnvelope;

export function createSecureMasterProviderAuditEnvelope(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
  adapterPrepared?: boolean;
  serverDryRunAvailable?: boolean;
  resultSummary?: string;
  providerName?: string;
  modelName?: string;
  nextSafeStep?: string;
} = {}): SecureMasterProviderAuditEnvelope {
  const id = 'provider_audit_' + Date.now();
  return {
    id,
    requestId: id,
    createdAt: new Date().toISOString(),
    auditPrepared: true,
    dispatchStatus: 'blocked_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsIncluded: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    llmCallPerformed: false,
    inputPreview: String(params.input ?? '').slice(0, 240),
    approvalDecision: params.approvalDecision ?? 'local_only',
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    adapterPrepared: Boolean(params.adapterPrepared),
    serverDryRunAvailable: Boolean(params.serverDryRunAvailable),
    providerName: params.providerName ?? 'none',
    modelName: params.modelName ?? 'none',
    requiredAuditFieldsLater: [
      'requestId',
      'createdAt',
      'providerName',
      'modelName',
      'privacyDecision',
      'approvalDecision',
      'providerCallAllowed',
      'secretsIncluded',
      'networkCallPerformed',
      'resultSummary',
    ],
    forbiddenAuditFields: [
      'apiKey',
      'secret',
      'token',
      'password',
      'rawProviderCredential',
      'fullUnredactedSensitiveInput',
    ],
    redactionRules: [
      'Keine API-Keys speichern',
      'Keine Tokens speichern',
      'Keine personenbezogenen Daten im Audit-Log speichern',
      'Input nur als gekuerzte Preview erfassen',
      'Secrets niemals in Browser/localStorage schreiben',
    ],
    resultSummary: params.resultSummary ?? 'Provider-Audit lokal erstellt. Kein externer Call.',
    blockedReason: 'Audit-Envelope ist lokal. Provider-Call bleibt blockiert.',
    nextSafeStep: params.nextSafeStep ?? 'Worker/Build gruen bekommen, dann Agent-Arbeitsmodus weiter nutzen.',
  };
}

export function createProviderAuditEnvelope(params: Parameters<typeof createSecureMasterProviderAuditEnvelope>[0] = {}) {
  return createSecureMasterProviderAuditEnvelope(params);
}

export function createProviderAuditHistoryItem(envelope: SecureMasterProviderAuditEnvelope): SecureMasterProviderAuditHistoryItem {
  return {
    ...envelope,
    id: envelope.id || 'provider_audit_' + Date.now(),
    requestId: envelope.requestId || envelope.id || 'provider_audit_' + Date.now(),
    createdAt: envelope.createdAt || new Date().toISOString(),
    auditPrepared: true,
    dispatchStatus: envelope.dispatchStatus || 'blocked_dry_run',
    secretsIncluded: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    llmCallPerformed: false,
    requiredAuditFieldsLater: envelope.requiredAuditFieldsLater || [],
    forbiddenAuditFields: envelope.forbiddenAuditFields || [],
    redactionRules: envelope.redactionRules || [],
    nextSafeStep: envelope.nextSafeStep || 'Weiter mit Build-Verifikation.',
  };
}

export default createSecureMasterProviderAuditEnvelope;

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
