import { getSecureMasterAnswerLogJsonExportStatus, type SecureMasterAnswerLogJsonExportStatus } from './cmt-master-answer-log-list-json-export-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonExportEntry = {
  phase: '137.2';
  label: 'Secure Master Answer Log JSON Export Entry';
  status: SecureMasterAnswerLogJsonExportStatus;
  primaryExportPage: '/cmt/master/secure/main/log/list/export-json';
  exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status';
  secureMasterPage: '/cmt/master/secure';
  exportApi: '/api/cmt/master/secure/main/log/list/export-json';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  exportState: {
    jsonExportEntryVisible: true;
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
    localTestable: true;
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonExportEntry(): SecureMasterAnswerLogJsonExportEntry {
  return {
    phase: '137.2',
    label: 'Secure Master Answer Log JSON Export Entry',
    status: getSecureMasterAnswerLogJsonExportStatus(),
    primaryExportPage: '/cmt/master/secure/main/log/list/export-json',
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    mainBrowserStoreStatusPage: '/cmt/master/secure/main/log/list/main-browser-store/status',
    secureMasterPage: '/cmt/master/secure',
    exportApi: '/api/cmt/master/secure/main/log/list/export-json',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'JSON-Export-Seite als lokalen Exportpunkt fuer Answer-Logs nutzen.',
      'Export vorbereiten und JSON herunterladen testen.',
      'JSON Preview auf Logs, Filter, Persistence State und Safety State pruefen.',
      'Statusseite zur Kontrolle der Export-Flags nutzen.',
      'Haupt-Logliste bleibt bevorzugter lokaler Loglisten-Testpunkt.',
      'Import noch nicht erwarten, nur vorbereitet.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'JSON-Export-Entry sichtbar.',
      'JSON-Export-Seite verlinkt.',
      'JSON-Export-Status verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'exportPrepared = true sichtbar.',
      'exportButtonVisible = true sichtbar.',
      'jsonPayloadPrepared = true sichtbar.',
      'downloadPrepared = true sichtbar.',
      'importPreparedLater = true sichtbar.',
      'includesLogs = true sichtbar.',
      'includesFilters = true sichtbar.',
      'includesPersistenceState = true sichtbar.',
      'includesSafetyState = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    exportState: {
      jsonExportEntryVisible: true,
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
      localTestable: true,
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    nextMilestone: 'Phase 137.3: Secure Master Answer Log JSON Export Handoff',
  };
}
