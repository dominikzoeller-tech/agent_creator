import { createSecureMasterAnswerLogMainBrowserStore, type SecureMasterAnswerLogMainBrowserStoreResult } from './cmt-master-answer-log-list-main-browser-store';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogJsonExportInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogJsonExportPayload = {
  schema: 'cmt.secureMaster.answerLogList.export.v1';
  phase: '137.0';
  exportedAt: string;
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  mainBrowserStore: SecureMasterAnswerLogMainBrowserStoreResult;
  exportState: {
    exportPrepared: true;
    exportButtonVisible: true;
    jsonPayloadPrepared: true;
    importPreparedLater: true;
    includesLogs: true;
    includesFilters: true;
    includesPersistenceState: true;
    includesSafetyState: true;
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
};

export function createSecureMasterAnswerLogJsonExport(input: SecureMasterAnswerLogJsonExportInput): SecureMasterAnswerLogJsonExportPayload {
  return {
    schema: 'cmt.secureMaster.answerLogList.export.v1',
    phase: '137.0',
    exportedAt: new Date().toISOString(),
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    mainBrowserStore: createSecureMasterAnswerLogMainBrowserStore(input),
    exportState: {
      exportPrepared: true,
      exportButtonVisible: true,
      jsonPayloadPrepared: true,
      importPreparedLater: true,
      includesLogs: true,
      includesFilters: true,
      includesPersistenceState: true,
      includesSafetyState: true,
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
  };
}

export function getSecureMasterAnswerLogJsonExportDemo() {
  return createSecureMasterAnswerLogJsonExport({
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
