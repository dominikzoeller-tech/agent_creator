import { createSecureMasterAnswerLogListMainSelect, type SecureMasterAnswerLogListMainSelectResult } from './cmt-master-answer-log-list-main-select';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export const SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY = 'cmt.secureMaster.answerLogList.v1';

export type SecureMasterAnswerLogBrowserStoreInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogBrowserStoreResult = {
  phase: '135.0';
  label: 'Secure Master Browser Log Store Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  mainSelect: SecureMasterAnswerLogListMainSelectResult;
  browserPersistence: {
    prepared: true;
    localStorageKeyVisible: true;
    canSaveInBrowser: true;
    canLoadFromBrowser: true;
    canClearBrowserLogs: true;
    persistedInBrowser: 'prepared_not_auto_enabled';
    persistedOnServer: false;
    serverStoragePrepared: false;
    exportPreparedLater: true;
  };
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    externalSharingAllowed: false;
    networkCallAllowed: false;
    finalDispatchBlocked: true;
  };
  note: string;
};

export function createSecureMasterAnswerLogBrowserStore(input: SecureMasterAnswerLogBrowserStoreInput): SecureMasterAnswerLogBrowserStoreResult {
  return {
    phase: '135.0',
    label: 'Secure Master Browser Log Store Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    mainSelect: createSecureMasterAnswerLogListMainSelect(input),
    browserPersistence: {
      prepared: true,
      localStorageKeyVisible: true,
      canSaveInBrowser: true,
      canLoadFromBrowser: true,
      canClearBrowserLogs: true,
      persistedInBrowser: 'prepared_not_auto_enabled',
      persistedOnServer: false,
      serverStoragePrepared: false,
      exportPreparedLater: true,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      externalSharingAllowed: false,
      networkCallAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 135.0 bereitet localStorage fuer die Haupt-Logliste vor. Speicherung bleibt browserseitig optional, Server-Persistenz bleibt false.',
  };
}

export function getSecureMasterAnswerLogBrowserStoreDemo() {
  return createSecureMasterAnswerLogBrowserStore({
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
