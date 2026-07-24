import { getSecureMasterAnswerLogListDemo, type SecureMasterAnswerLogListResult } from './cmt-master-answer-log-list';

export type SecureMasterAnswerLogListStatus = {
  phase: '130.1';
  label: 'Secure Master In-Memory Answer Log List Status';
  listPage: '/cmt/master/secure/main/log/list';
  listApi: '/api/cmt/master/secure/main/log/list';
  singleLogPage: '/cmt/master/secure/main/log';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogListResult;
  listState: {
    inMemoryListVisible: true;
    multipleLogsVisible: true;
    countVisible: true;
    itemFieldsVisible: true;
    usesSingleLogStore: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleFields: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterAnswerLogListStatus(): SecureMasterAnswerLogListStatus {
  return {
    phase: '130.1',
    label: 'Secure Master In-Memory Answer Log List Status',
    listPage: '/cmt/master/secure/main/log/list',
    listApi: '/api/cmt/master/secure/main/log/list',
    singleLogPage: '/cmt/master/secure/main/log',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogListDemo(),
    listState: {
      inMemoryListVisible: true,
      multipleLogsVisible: true,
      countVisible: true,
      itemFieldsVisible: true,
      usesSingleLogStore: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale In-Memory-Logliste zeigt mehrere Secure-Master-Logobjekte. Die Liste nutzt das bestehende Einzel-Log, speichert aber nichts dauerhaft.',
    },
    visibleFields: [
      'count',
      'id',
      'createdAt',
      'inputPreview',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary',
      'safety.finalDispatchBlocked',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Loglist Entry ergaenzen',
      'Loglist Handoff ergaenzen',
      'optionale Filter/Suche vorbereiten',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
