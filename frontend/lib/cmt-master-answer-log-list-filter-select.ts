import { filterSecureMasterAnswerLogList, type SecureMasterAnswerLogListFilterResult } from './cmt-master-answer-log-list-filter';
import { deriveSecureMasterAnswerLogListFilterOptions, type SecureMasterAnswerLogListFilterOptionsResult } from './cmt-master-answer-log-list-filter-options';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListFilterSelectInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListFilterSelectResult = {
  phaseSelect: '133.0';
  label: 'Secure Master Local Answer Log List Filter Select';
  filter: SecureMasterAnswerLogListFilterResult;
  options: SecureMasterAnswerLogListFilterOptionsResult;
  selectState: {
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    searchVisible: true;
    optionsDerivedLocally: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

export function createSecureMasterAnswerLogListFilterSelect(input: SecureMasterAnswerLogListFilterSelectInput): SecureMasterAnswerLogListFilterSelectResult {
  const options = deriveSecureMasterAnswerLogListFilterOptions({ items: input.items });
  const filter = filterSecureMasterAnswerLogList(input);

  return {
    phaseSelect: '133.0',
    label: 'Secure Master Local Answer Log List Filter Select',
    filter,
    options,
    selectState: {
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      searchVisible: true,
      optionsDerivedLocally: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 133.0 integriert lokal abgeleitete Dropdown-Optionen in eine Filter-Select-Ansicht. Suche bleibt lokal, keine Persistenz, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterSelectDemo() {
  return createSecureMasterAnswerLogListFilterSelect({
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
