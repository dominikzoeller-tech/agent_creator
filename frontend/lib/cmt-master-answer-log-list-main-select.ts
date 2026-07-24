import { createSecureMasterAnswerLogListFilterSelect, type SecureMasterAnswerLogListFilterSelectResult } from './cmt-master-answer-log-list-filter-select';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListMainSelectInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListMainSelectResult = {
  phase: '134.0';
  label: 'Secure Master Main Log List Select Integration';
  select: SecureMasterAnswerLogListFilterSelectResult;
  mainLogListPage: '/cmt/master/secure/main/log/list';
  selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
  optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
  status: {
    mainLogListSelectIntegrated: true;
    searchVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    controlPagesPreserved: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

export function createSecureMasterAnswerLogListMainSelect(input: SecureMasterAnswerLogListMainSelectInput): SecureMasterAnswerLogListMainSelectResult {
  const select = createSecureMasterAnswerLogListFilterSelect(input);
  return {
    phase: '134.0',
    label: 'Secure Master Main Log List Select Integration',
    select,
    mainLogListPage: '/cmt/master/secure/main/log/list',
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
    status: {
      mainLogListSelectIntegrated: true,
      searchVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      controlPagesPreserved: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 134.0 integriert die Select-Filterbedienung direkt in die Haupt-Loglistenansicht. Alles bleibt lokal und in-memory.',
  };
}

export function getSecureMasterAnswerLogListMainSelectDemo() {
  return createSecureMasterAnswerLogListMainSelect({
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
