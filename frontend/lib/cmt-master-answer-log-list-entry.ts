import { getSecureMasterAnswerLogListStatus, type SecureMasterAnswerLogListStatus } from './cmt-master-answer-log-list-status';

export type SecureMasterAnswerLogListEntry = {
  phase: '130.2';
  label: 'Secure Master In-Memory Answer Log List Entry';
  status: SecureMasterAnswerLogListStatus;
  primaryListPage: '/cmt/master/secure/main/log/list';
  listStatusPage: '/cmt/master/secure/main/log/list/status';
  singleLogPage: '/cmt/master/secure/main/log';
  mainPage: '/cmt/master/secure';
  listApi: '/api/cmt/master/secure/main/log/list';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleListFields: string[];
  safety: {
    localTestable: true;
    inMemoryListVisible: true;
    multipleLogsVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListEntry(): SecureMasterAnswerLogListEntry {
  return {
    phase: '130.2',
    label: 'Secure Master In-Memory Answer Log List Entry',
    status: getSecureMasterAnswerLogListStatus(),
    primaryListPage: '/cmt/master/secure/main/log/list',
    listStatusPage: '/cmt/master/secure/main/log/list/status',
    singleLogPage: '/cmt/master/secure/main/log',
    mainPage: '/cmt/master/secure',
    listApi: '/api/cmt/master/secure/main/log/list',
    recommendedUse: [
      'Loglisten-Seite fuer mehrere lokale Protokollobjekte verwenden.',
      'Statusseite zur Kontrolle der In-Memory-List verwenden.',
      'Einzel-Log-Seite als Detail-Kontrollseite behalten.',
      'Bei internen Daten Privacy-Entscheidung und Safety State pruefen.',
      'Noch keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    sampleQuestions: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    visibleListFields: [
      'count',
      'id',
      'createdAt',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary length',
      'finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      inMemoryListVisible: true,
      multipleLogsVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 130.3: Secure Master In-Memory Answer Log List Handoff',
  };
}
