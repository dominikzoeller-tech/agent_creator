import { getSecureMasterAnswerLogListMainSelectStatus, type SecureMasterAnswerLogListMainSelectStatus } from './cmt-master-answer-log-list-main-select-status';

export type SecureMasterAnswerLogListMainSelectEntry = {
  phase: '134.2';
  label: 'Secure Master Main Log List Select Entry';
  status: SecureMasterAnswerLogListMainSelectStatus;
  primaryMainLogListPage: '/cmt/master/secure/main/log/list';
  mainLogListStatusPage: '/cmt/master/secure/main/log/list/select/status';
  selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
  optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
  secureMasterPage: '/cmt/master/secure';
  mainSelectApi: '/api/cmt/master/secure/main/log/list/select';
  recommendedUse: string[];
  uiChecklist: string[];
  safety: {
    localTestable: true;
    mainLogListEntryVisible: true;
    mainLogListSelectIntegrated: true;
    searchVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    controlPagesPreserved: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListMainSelectEntry(): SecureMasterAnswerLogListMainSelectEntry {
  return {
    phase: '134.2',
    label: 'Secure Master Main Log List Select Entry',
    status: getSecureMasterAnswerLogListMainSelectStatus(),
    primaryMainLogListPage: '/cmt/master/secure/main/log/list',
    mainLogListStatusPage: '/cmt/master/secure/main/log/list/select/status',
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
    secureMasterPage: '/cmt/master/secure',
    mainSelectApi: '/api/cmt/master/secure/main/log/list/select',
    recommendedUse: [
      'Haupt-Logliste als neue Standardseite fuer lokale Answer-Logs nutzen.',
      'Statusseite zur Kontrolle der integrierten Select-Filter nutzen.',
      'Select-Kontrollseite nur noch fuer gezielte Tests verwenden.',
      'Options-Kontrollseite nur noch fuer Dropdown-Ableitung verwenden.',
      'Route, Intent und Privacy in der Haupt-Logliste testen.',
      'Suche ueber inputPreview in der Haupt-Logliste testen.',
      'Keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Haupt-Logliste erreichbar.',
      'Route-Select direkt in Haupt-Logliste sichtbar.',
      'Intent-Select direkt in Haupt-Logliste sichtbar.',
      'Privacy-Select direkt in Haupt-Logliste sichtbar.',
      'Suchfeld direkt in Haupt-Logliste sichtbar.',
      'sourceCount sichtbar.',
      'filteredCount sichtbar.',
      'gefilterte Items sichtbar.',
      'controlPagesPreserved = true sichtbar.',
      'persistedInBrowser = false sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    safety: {
      localTestable: true,
      mainLogListEntryVisible: true,
      mainLogListSelectIntegrated: true,
      searchVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      controlPagesPreserved: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 134.3: Secure Master Main Log List Select Handoff',
  };
}
