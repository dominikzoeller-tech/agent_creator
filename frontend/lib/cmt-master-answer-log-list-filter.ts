/* Legacy CMT compatibility module: cmt-master-answer-log-list-filter.ts. */
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

import { createSecureMasterAnswerLogList, type SecureMasterAnswerLogListItem } from './cmt-master-answer-log-list';


export type SecureMasterAnswerLogListFilterInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListFilterResult = {
  phaseFilter: '131.0';
  label: 'Secure Master Local Answer Log List Filter';
  sourceCount: number;
  filteredCount: number;
  items: SecureMasterAnswerLogListItem[];
  filters: {
    search: string;
    route: string;
    intent: string;
    privacyDecision: string;
  };
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  safety: {
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

function matchText(value: string, filter: string) {
  if (!filter.trim()) return true;
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

function matchExactOrAll(value: string, filter: string) {
  if (!filter.trim() || filter === 'all') return true;
  return value === filter;
}

export function filterSecureMasterAnswerLogList(input: SecureMasterAnswerLogListFilterInput): SecureMasterAnswerLogListFilterResult {
  const list = createSecureMasterAnswerLogList(input.items);
  const search = input.search ?? '';
  const route = input.route ?? 'all';
  const intent = input.intent ?? 'all';
  const privacyDecision = input.privacyDecision ?? 'all';

  const items = list.items.filter((item: any) => {
    return matchText(item.inputPreview, search)
      && matchExactOrAll(item.finalRoute, route)
      && matchExactOrAll(item.detectedIntent, intent)
      && matchExactOrAll(item.privacyDecision, privacyDecision);
  });

  return {
    phaseFilter: '131.0',
    label: 'Secure Master Local Answer Log List Filter',
    sourceCount: list.count,
    filteredCount: items.length,
    items,
    filters: { search, route, intent, privacyDecision },
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 131.0 filtert die lokale In-Memory-Logliste nach Suche, Route, Intent und Privacy-Entscheidung. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterDemo() {
  return filterSecureMasterAnswerLogList({
    items: [
      { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
      { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
      { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
      { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
      { input: 'Wie ist morgen das Wetter?', option: 'local_only' },
      { input: 'Baue mir spaeter einen Trading-Agenten.', option: 'local_only' },
    ],
    search: '',
    route: 'all',
    intent: 'all',
    privacyDecision: 'all',
  });
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
export default makeCompatStub('default:cmt-master-answer-log-list-filter.ts');
