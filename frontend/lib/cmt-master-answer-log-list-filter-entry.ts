import { getSecureMasterAnswerLogListFilterStatus, type SecureMasterAnswerLogListFilterStatus } from './cmt-master-answer-log-list-filter-status';

export type SecureMasterAnswerLogListFilterEntry = {
  phase: '131.2';
  label: 'Secure Master Local Answer Log List Filter Entry';
  status: SecureMasterAnswerLogListFilterStatus;
  primaryFilterPage: '/cmt/master/secure/main/log/list/filter';
  filterStatusPage: '/cmt/master/secure/main/log/list/filter/status';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  filterApi: '/api/cmt/master/secure/main/log/list/filter';
  recommendedUse: string[];
  sampleFilters: string[];
  visibleFilterFields: string[];
  safety: {
    localTestable: true;
    localSearchVisible: true;
    routeFilterVisible: true;
    intentFilterVisible: true;
    privacyDecisionFilterVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListFilterEntry(): SecureMasterAnswerLogListFilterEntry {
  return {
    phase: '131.2',
    label: 'Secure Master Local Answer Log List Filter Entry',
    status: getSecureMasterAnswerLogListFilterStatus(),
    primaryFilterPage: '/cmt/master/secure/main/log/list/filter',
    filterStatusPage: '/cmt/master/secure/main/log/list/filter/status',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    filterApi: '/api/cmt/master/secure/main/log/list/filter',
    recommendedUse: [
      'Filterseite fuer lokale Suche und Filtertests verwenden.',
      'Statusseite zur Kontrolle der sichtbaren Filterfelder nutzen.',
      'Logliste als ungefilterte Kontrollseite behalten.',
      'Suche ueber inputPreview mit kurzen Stichworten testen.',
      'Route, Intent und Privacy-Entscheidung mit all oder exakten Werten testen.',
      'Persistenz, Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    sampleFilters: [
      'search=intern',
      'search=Gremium',
      'search=Trading',
      'route=all',
      'intent=all',
      'privacyDecision=all',
      'privacyDecision=local_only',
    ],
    visibleFilterFields: [
      'sourceCount',
      'filteredCount',
      'search',
      'route',
      'intent',
      'privacyDecision',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      localSearchVisible: true,
      routeFilterVisible: true,
      intentFilterVisible: true,
      privacyDecisionFilterVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 131.3: Secure Master Local Answer Log List Filter Handoff',
  };
}
