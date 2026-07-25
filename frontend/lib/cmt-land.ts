/* Legacy CMT compatibility module: cmt-land.ts. */
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

import { getCommitteeMvpDemo, type CommitteeMvpDemo } from './cmt-demo';
import { getCommitteeDemoReport, type CommitteeDemoReport } from './cmt-demo-report';
import { getCommitteeDemoShare, type CommitteeDemoShare } from './cmt-demo-share';

export type CommitteeLanding = {
  phase: '115.0';
  label: 'Gremium MVP Landing';
  hero: {
    title: string;
    subtitle: string;
    primaryPath: string;
    secondaryPath: string;
  };
  links: {
    title: string;
    href: string;
    description: string;
  }[];
  demo: CommitteeMvpDemo;
  report: CommitteeDemoReport;
  share: CommitteeDemoShare;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLanding(): CommitteeLanding {
  return {
    phase: '115.0',
    label: 'Gremium MVP Landing',
    hero: {
      title: 'Gremium-Agent MVP',
      subtitle: 'Eine dry-run-only Landing Page fuer Demo, Report und Share des Gremium-Agenten.',
      primaryPath: '/cmt/demo',
      secondaryPath: '/cmt/demo/share',
    },
    links: [
      { title: 'Demo starten', href: '/cmt/demo', description: 'Fuehrt eine Nutzerfrage durch den MVP-Demo-Flow.' },
      { title: 'Report ansehen', href: '/cmt/demo/report', description: 'Zeigt den kompakten Demo-Report.' },
      { title: 'Share erzeugen', href: '/cmt/demo/share', description: 'Erstellt eine copy-ready Kurzfassung.' },
      { title: 'Session Summary', href: '/cmt/sum', description: 'Zeigt die Zusammenfassung gespeicherter Gremiumsfragen.' },
    ],
    demo: getCommitteeMvpDemo(),
    report: getCommitteeDemoReport(),
    share: getCommitteeDemoShare(),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
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
export default makeCompatStub('default:cmt-land.ts');
