import { getSecureMasterAnswerLogListFilterDemo, type SecureMasterAnswerLogListFilterResult } from './cmt-master-answer-log-list-filter';

export type SecureMasterAnswerLogListFilterStatus = {
  phase: '131.1';
  label: 'Secure Master Local Answer Log List Filter Status';
  filterPage: '/cmt/master/secure/main/log/list/filter';
  filterApi: '/api/cmt/master/secure/main/log/list/filter';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogListFilterResult;
  filterState: {
    localSearchVisible: true;
    routeFilterVisible: true;
    intentFilterVisible: true;
    privacyDecisionFilterVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleFields: string[];
  testFilters: string[];
  nextMilestones: string[];
};

export function getSecureMasterAnswerLogListFilterStatus(): SecureMasterAnswerLogListFilterStatus {
  return {
    phase: '131.1',
    label: 'Secure Master Local Answer Log List Filter Status',
    filterPage: '/cmt/master/secure/main/log/list/filter',
    filterApi: '/api/cmt/master/secure/main/log/list/filter',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogListFilterDemo(),
    filterState: {
      localSearchVisible: true,
      routeFilterVisible: true,
      intentFilterVisible: true,
      privacyDecisionFilterVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale Filteransicht fuer die In-Memory-Logliste ist sichtbar. Suche, Route, Intent und Privacy-Entscheidung koennen lokal gefiltert werden. Es gibt weiterhin keine dauerhafte Speicherung.',
    },
    visibleFields: [
      'sourceCount',
      'filteredCount',
      'search',
      'route',
      'intent',
      'privacyDecision',
      'inputPreview',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    testFilters: [
      'search=intern',
      'search=Gremium',
      'route=all',
      'intent=all',
      'privacyDecision=local_only',
      'privacyDecision=all',
    ],
    nextMilestones: [
      'Filter Entry ergaenzen',
      'Filter Handoff ergaenzen',
      'Filterwerte spaeter als Dropdowns ableiten',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
