/* Legacy CMT compatibility module: cmt-brief.ts. */
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

import { createCommitteeDecisionResult, type CommitteeDecisionResult } from './cmt-result';

export type CommitteeBrief = {
  phase: '111.2';
  label: 'Gremium Brief';
  result: CommitteeDecisionResult;
  brief: {
    headline: string;
    decision: string;
    why: string[];
    risks: string[];
    actions: string[];
    userMessage: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeBrief(question: string): CommitteeBrief {
  const result = createCommitteeDecisionResult(question);
  const verdict = result.decision.verdict;
  const headline = verdict === 'proceed-dry-run'
    ? 'Gremium empfiehlt Fortsetzung im Dry-run.'
    : verdict === 'revise-before-proceeding'
      ? 'Gremium empfiehlt Ueberarbeitung vor Fortsetzung.'
      : 'Gremium blockiert Fortsetzung.';

  return {
    phase: '111.2',
    label: 'Gremium Brief',
    result,
    brief: {
      headline,
      decision: verdict,
      why: result.decision.rationale,
      risks: result.decision.risks,
      actions: result.decision.nextActions,
      userMessage: 'Kurzfassung: ' + headline + ' Die Details bleiben intern und dry-run-only.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeBriefDemo() {
  return createCommitteeBrief('Soll der Agent die Gremiumsentscheidung als kurze Nutzerantwort mit Risiken und Aktionen zusammenfassen?');
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
export default makeCompatStub('default:cmt-brief.ts');
