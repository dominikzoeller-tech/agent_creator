import { createSecureMasterAnswerLogList, type SecureMasterAnswerLogListItem } from './cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

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

  const items = list.items.filter((item) => {
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
