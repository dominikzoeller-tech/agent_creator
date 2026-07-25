/* Legacy CMT compatibility module: cmt-demo.ts. */
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

import { createCommitteeSessionSummary, type CommitteeSessionSummary } from './cmt-sum';

export type CommitteeMvpDemo = {
  phase: '114.0';
  label: 'Gremium MVP Demo';
  demoId: string;
  userQuestion: string;
  flow: {
    step: string;
    result: string;
  }[];
  summary: CommitteeSessionSummary;
  finalAnswer: {
    headline: string;
    recommendation: string;
    risks: string[];
    actions: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeMvpDemo(question: string): CommitteeMvpDemo {
  const safeQuestion = question.trim() || 'Soll der Agent diese Entscheidung mit dem Gremium bewerten?';
  const summary = createCommitteeSessionSummary([
    safeQuestion,
    'Welche Risiken sieht das Gremium?',
    'Welche naechsten Aktionen empfiehlt das Gremium?',
  ]);

  return {
    phase: '114.0',
    label: 'Gremium MVP Demo',
    demoId: 'demo-114-0',
    userQuestion: safeQuestion,
    flow: [
      { step: '1 intake', result: 'User-Frage wurde dry-run-only angenommen.' },
      { step: '2 routing', result: 'Passende Gremiumsrollen wurden intern ausgewaehlt.' },
      { step: '3 deliberation', result: 'Rollenmeinungen wurden simuliert erzeugt.' },
      { step: '4 result', result: 'Entscheidung, Risiken und Aktionen wurden aggregiert.' },
      { step: '5 summary', result: 'Session-Zusammenfassung wurde erstellt.' },
    ],
    summary,
    finalAnswer: {
      headline: 'MVP-Demo erfolgreich erzeugt.',
      recommendation: summary.summary.decisions[0] ?? 'proceed-dry-run',
      risks: summary.summary.topRisks,
      actions: summary.summary.nextActions,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeMvpDemo() {
  return createCommitteeMvpDemo('Soll der Gremium-Agent als MVP-Demo eine Frage komplett durch den internen Flow fuehren?');
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
export default makeCompatStub('default:cmt-demo.ts');
