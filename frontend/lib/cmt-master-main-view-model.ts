/* Legacy CMT compatibility module: cmt-master-main-view-model.ts. */
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

import { askSecureMasterUnified, type SecureMasterUnifiedResult } from './cmt-master-unified';


export type SecureMasterMainBadge = {
  label: string;
  value: string;
  tone: 'neutral' | 'good' | 'warn' | 'blocked';
};

export type SecureMasterMainViewModel = SecureMasterUnifiedResult & {
  phaseView: '128.0';
  viewLabel: 'Secure Master Main Structured View';
  badges: SecureMasterMainBadge[];
  compactBlocks: {
    title: string;
    body: string;
    priority: 'primary' | 'secondary' | 'safety';
  }[];
  roleCards: {
    title: string;
    subtitle: string;
    body: string;
  }[];
};

function toneForBoolean(value: boolean, goodWhenTrue = true): SecureMasterMainBadge['tone'] {
  if (value === goodWhenTrue) return 'good';
  return 'warn';
}

function badges(result: SecureMasterUnifiedResult): SecureMasterMainBadge[] {
  return [
    { label: 'Route', value: result.finalRoute, tone: 'neutral' },
    { label: 'Intent', value: result.detectedIntent, tone: 'neutral' },
    { label: 'Privacy Gate', value: result.showsPrivacyGate ? 'visible' : 'not needed', tone: result.showsPrivacyGate ? 'warn' : 'good' },
    { label: 'Gremium', value: result.showsCommitteeWhenNeeded ? 'visible' : 'not needed', tone: result.showsCommitteeWhenNeeded ? 'neutral' : 'good' },
    { label: 'Live Model', value: result.liveModelEnabled ? 'enabled' : 'disabled', tone: result.liveModelEnabled ? 'warn' : 'good' },
    { label: 'External Sharing', value: result.externalSharingAllowed ? 'allowed' : 'blocked', tone: result.externalSharingAllowed ? 'warn' : 'blocked' },
    { label: 'Network', value: result.networkCallAllowed ? 'allowed' : 'blocked', tone: result.networkCallAllowed ? 'warn' : 'blocked' },
  ];
}

function compactBlocks(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['compactBlocks'] {
  const blocks = result.unifiedAnswerBlocks.map((block: any) => ({
    title: block.title,
    body: block.body,
    priority: block.title === 'Lokale Antwort' ? 'primary' as const : block.title === 'Safety' ? 'safety' as const : 'secondary' as const,
  }));

  if (!blocks.some((block: any) => block.title === 'Safety')) {
    blocks.push({
      title: 'Safety',
      body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
      priority: 'safety',
    });
  }

  return blocks;
}

function roleCards(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['roleCards'] {
  return result.committeeRoles.map((role: any) => ({
    title: role.name,
    subtitle: role.focus,
    body: role.answer,
  }));
}

export function askSecureMasterMainView(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterMainViewModel {
  const result = askSecureMasterUnified(input, option);
  return {
    ...result,
    phaseView: '128.0',
    viewLabel: 'Secure Master Main Structured View',
    badges: badges(result),
    compactBlocks: compactBlocks(result),
    roleCards: roleCards(result),
  };
}

export function getSecureMasterMainViewDemo() {
  return askSecureMasterMainView('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
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
export default makeCompatStub('default:cmt-master-main-view-model.ts');
