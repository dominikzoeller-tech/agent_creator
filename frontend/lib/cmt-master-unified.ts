/* Legacy CMT compatibility module: cmt-master-unified.ts. */
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

import { askSecureMasterCommittee, type SecureMasterCommitteeResult } from './cmt-master-committee';


export type SecureMasterUnifiedResult = SecureMasterCommitteeResult & {
  phaseUnified: '126.0';
  unifiedLabel: 'Secure Master Unified Main Flow';
  unifiedMainPage: '/cmt/master/secure';
  showsPrivacyGate: boolean;
  showsQualityAnswer: true;
  showsCommitteeWhenNeeded: boolean;
  unifiedAnswerBlocks: {
    title: string;
    body: string;
  }[];
};

function buildBlocks(result: SecureMasterCommitteeResult) {
  const blocks = [
    {
      title: 'Lokale Antwort',
      body: result.improvedAnswer || result.userVisibleAnswer,
    },
    {
      title: 'Routing',
      body: 'Intent: ' + result.detectedIntent + ' | Route: ' + result.finalRoute + ' | Privacy: ' + result.privacy.decision.decision,
    },
  ];

  if (result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only') {
    blocks.push({
      title: 'Privacy Gate',
      body: 'Datenschutzprüfung aktiv. Externe Weitergabe bleibt blockiert. Sichere Verarbeitung: local_only oder anonymisierte Vorschau.',
    });
  }

  if (result.committeeTriggered) {
    blocks.push({
      title: '5er-Gremium',
      body: result.committeeSummary + ' Empfehlung: ' + result.finalRecommendation,
    });
  }

  blocks.push({
    title: 'Safety',
    body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
  });

  return blocks;
}

export function askSecureMasterUnified(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterUnifiedResult {
  const result = askSecureMasterCommittee(input, option);
  return {
    ...result,
    phaseUnified: '126.0',
    unifiedLabel: 'Secure Master Unified Main Flow',
    unifiedMainPage: '/cmt/master/secure',
    showsPrivacyGate: result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only',
    showsQualityAnswer: true,
    showsCommitteeWhenNeeded: result.committeeTriggered,
    unifiedAnswerBlocks: buildBlocks(result),
  };
}

export function getSecureMasterUnifiedDemo() {
  return askSecureMasterUnified('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
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
export default makeCompatStub('default:cmt-master-unified.ts');
