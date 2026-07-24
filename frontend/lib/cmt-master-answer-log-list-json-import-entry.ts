import { getSecureMasterAnswerLogJsonImportStatus, type SecureMasterAnswerLogJsonImportStatus } from './cmt-master-answer-log-list-json-import-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportEntry = {
  phase: '138.2';
  label: 'Secure Master Answer Log JSON Import Entry';
  status: SecureMasterAnswerLogJsonImportStatus;
  primaryImportPage: '/cmt/master/secure/main/log/list/import-json';
  importStatusPage: '/cmt/master/secure/main/log/list/import-json/status';
  exportPage: '/cmt/master/secure/main/log/list/export-json';
  exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  secureMasterPage: '/cmt/master/secure';
  importApi: '/api/cmt/master/secure/main/log/list/import-json';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  importState: {
    jsonImportEntryVisible: true;
    importPrepared: true;
    importUiVisible: true;
    schemaCheckPrepared: true;
    importPreviewPrepared: true;
    validationPrepared: true;
    applyImportAutomatically: false;
    manualApplyRequiredLater: true;
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

export function getSecureMasterAnswerLogJsonImportEntry(): SecureMasterAnswerLogJsonImportEntry {
  return {
    phase: '138.2',
    label: 'Secure Master Answer Log JSON Import Entry',
    status: getSecureMasterAnswerLogJsonImportStatus(),
    primaryImportPage: '/cmt/master/secure/main/log/list/import-json',
    importStatusPage: '/cmt/master/secure/main/log/list/import-json/status',
    exportPage: '/cmt/master/secure/main/log/list/export-json',
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    secureMasterPage: '/cmt/master/secure',
    importApi: '/api/cmt/master/secure/main/log/list/import-json',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'JSON-Import-Seite als lokalen Import-Pruefpunkt fuer Answer-Log-Exporte nutzen.',
      'Export-JSON einfuegen und Import Preview vorbereiten.',
      'Schema-Pruefung und Validation kontrollieren.',
      'Import Preview pruefen, aber Import noch nicht anwenden.',
      'Statusseite zur Kontrolle der Import-Flags nutzen.',
      'Haupt-Logliste bleibt bevorzugter lokaler Loglisten-Testpunkt.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'JSON-Import-Entry sichtbar.',
      'JSON-Import-Seite verlinkt.',
      'JSON-Import-Status verlinkt.',
      'JSON-Export-Seite verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'importPrepared = true sichtbar.',
      'importUiVisible = true sichtbar.',
      'schemaCheckPrepared = true sichtbar.',
      'importPreviewPrepared = true sichtbar.',
      'validationPrepared = true sichtbar.',
      'applyImportAutomatically = false sichtbar.',
      'manualApplyRequiredLater = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    importState: {
      jsonImportEntryVisible: true,
      importPrepared: true,
      importUiVisible: true,
      schemaCheckPrepared: true,
      importPreviewPrepared: true,
      validationPrepared: true,
      applyImportAutomatically: false,
      manualApplyRequiredLater: true,
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
    nextMilestone: 'Phase 138.3: Secure Master Answer Log JSON Import Handoff',
  };
}
