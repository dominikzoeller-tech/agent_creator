import { getSecureMasterAnswerLogStatus, type SecureMasterAnswerLogStatus } from './cmt-master-answer-log-status';

export type SecureMasterAnswerLogEntryInfo = {
  phase: '129.2';
  label: 'Secure Master Local Answer Log Entry';
  status: SecureMasterAnswerLogStatus;
  primaryLogPage: '/cmt/master/secure/main/log';
  logStatusPage: '/cmt/master/secure/main/log/status';
  mainPage: '/cmt/master/secure';
  logApi: '/api/cmt/master/secure/main/log';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleLogFields: string[];
  safety: {
    localTestable: true;
    answerLogVisible: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogEntry(): SecureMasterAnswerLogEntryInfo {
  return {
    phase: '129.2',
    label: 'Secure Master Local Answer Log Entry',
    status: getSecureMasterAnswerLogStatus(),
    primaryLogPage: '/cmt/master/secure/main/log',
    logStatusPage: '/cmt/master/secure/main/log/status',
    mainPage: '/cmt/master/secure',
    logApi: '/api/cmt/master/secure/main/log',
    recommendedUse: [
      'Answer-Log-Seite fuer einzelne lokale Protokollobjekte verwenden.',
      'Statusseite zur Kontrolle der sichtbaren Felder nutzen.',
      'Bei internen Daten Privacy-Entscheidung und Safety State pruefen.',
      'Bei Entscheidungsfragen Badge Summary und Gremiumsergebnis pruefen.',
      'Noch keine dauerhafte Speicherung erwarten.',
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
    visibleLogFields: [
      'id',
      'createdAt',
      'inputPreview',
      'option',
      'detectedIntent',
      'finalRoute',
      'privacyDecision',
      'badgeSummary',
      'safety',
      'localOnly',
      'persistedInBrowser',
      'persistedOnServer',
    ],
    safety: {
      localTestable: true,
      answerLogVisible: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 129.3: Secure Master Local Answer Log Handoff',
  };
}
