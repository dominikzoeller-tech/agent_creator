import { getSecureMasterAnswerLogListMainSelectDemo, type SecureMasterAnswerLogListMainSelectResult } from './cmt-master-answer-log-list-main-select';

export type SecureMasterAnswerLogListMainSelectStatus = {
  phase: '134.1';
  label: 'Secure Master Main Log List Select Status';
  mainSelect: SecureMasterAnswerLogListMainSelectResult;
  pages: {
    mainLogListPage: '/cmt/master/secure/main/log/list';
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
    secureMasterPage: '/cmt/master/secure';
  };
  status: {
    localTestable: true;
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
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListMainSelectStatus(): SecureMasterAnswerLogListMainSelectStatus {
  return {
    phase: '134.1',
    label: 'Secure Master Main Log List Select Status',
    mainSelect: getSecureMasterAnswerLogListMainSelectDemo(),
    pages: {
      mainLogListPage: '/cmt/master/secure/main/log/list',
      selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
      optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
      secureMasterPage: '/cmt/master/secure',
    },
    status: {
      localTestable: true,
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
    checks: [
      'Haupt-Loglistenansicht ist erreichbar.',
      'Select-Filter sind direkt in der Haupt-Logliste sichtbar.',
      'Route-Select ist sichtbar.',
      'Intent-Select ist sichtbar.',
      'Privacy-Select ist sichtbar.',
      'Suche ueber inputPreview ist sichtbar.',
      'sourceCount ist sichtbar.',
      'filteredCount ist sichtbar.',
      'Kontrollseiten bleiben erhalten.',
      'persistedInBrowser = false.',
      'persistedOnServer = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 134.2: Secure Master Main Log List Select Entry',
  };
}
