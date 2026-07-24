import { getSecureMasterAnswerLogJsonExportDemo, type SecureMasterAnswerLogJsonExportPayload } from './cmt-master-answer-log-list-json-export';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonExportStatus = {
  phase: '137.1';
  label: 'Secure Master Answer Log JSON Export Status';
  exportDemo: SecureMasterAnswerLogJsonExportPayload;
  pages: {
    exportPage: '/cmt/master/secure/main/log/list/export-json';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status';
    secureMasterPage: '/cmt/master/secure';
  };
  exportStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
    exportPrepared: true;
    exportButtonVisible: true;
    jsonPayloadPrepared: true;
    downloadPrepared: true;
    importPreparedLater: true;
    includesLogs: true;
    includesFilters: true;
    includesPersistenceState: true;
    includesSafetyState: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonExportStatus(): SecureMasterAnswerLogJsonExportStatus {
  return {
    phase: '137.1',
    label: 'Secure Master Answer Log JSON Export Status',
    exportDemo: getSecureMasterAnswerLogJsonExportDemo(),
    pages: {
      exportPage: '/cmt/master/secure/main/log/list/export-json',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status',
      secureMasterPage: '/cmt/master/secure',
    },
    exportStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
      exportPrepared: true,
      exportButtonVisible: true,
      jsonPayloadPrepared: true,
      downloadPrepared: true,
      importPreparedLater: true,
      includesLogs: true,
      includesFilters: true,
      includesPersistenceState: true,
      includesSafetyState: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    checks: [
      'JSON-Export-Seite ist erreichbar.',
      'Export-Button ist sichtbar.',
      'Download ist vorbereitet.',
      'JSON-Payload ist vorbereitet.',
      'Logs sind enthalten.',
      'Filter sind enthalten.',
      'Persistence State ist enthalten.',
      'Safety State ist enthalten.',
      'Import ist fuer spaeter vorbereitet.',
      'Browser-Speicher bleibt erhalten.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 137.2: Secure Master Answer Log JSON Export Entry',
  };
}
