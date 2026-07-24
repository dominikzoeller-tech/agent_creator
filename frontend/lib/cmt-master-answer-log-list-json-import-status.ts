import { getSecureMasterAnswerLogJsonImportDemo, type SecureMasterAnswerLogJsonImportResult } from './cmt-master-answer-log-list-json-import';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportStatus = {
  phase: '138.1';
  label: 'Secure Master Answer Log JSON Import Status';
  importDemo: SecureMasterAnswerLogJsonImportResult;
  pages: {
    importPage: '/cmt/master/secure/main/log/list/import-json';
    exportPage: '/cmt/master/secure/main/log/list/export-json';
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    secureMasterPage: '/cmt/master/secure';
  };
  importStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
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

export function getSecureMasterAnswerLogJsonImportStatus(): SecureMasterAnswerLogJsonImportStatus {
  return {
    phase: '138.1',
    label: 'Secure Master Answer Log JSON Import Status',
    importDemo: getSecureMasterAnswerLogJsonImportDemo(),
    pages: {
      importPage: '/cmt/master/secure/main/log/list/import-json',
      exportPage: '/cmt/master/secure/main/log/list/export-json',
      exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      secureMasterPage: '/cmt/master/secure',
    },
    importStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
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
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    checks: [
      'JSON-Import-Seite ist erreichbar.',
      'Import-UI ist sichtbar.',
      'Schema-Pruefung ist vorbereitet.',
      'Validation ist vorbereitet.',
      'Import Preview ist vorbereitet.',
      'Import wird nicht automatisch angewendet.',
      'Manuelle Anwendung ist fuer spaeter vorbereitet.',
      'Browser-Speicher bleibt erhalten.',
      'persistedInBrowser = browser_optional_local.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 138.2: Secure Master Answer Log JSON Import Entry',
  };
}
