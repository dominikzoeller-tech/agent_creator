import { getSecureMasterMainViewStatus, type SecureMasterMainViewStatus } from './cmt-master-main-view-status';

export type SecureMasterMainViewEntry = {
  phase: '128.2';
  label: 'Secure Master Structured Main View Entry';
  status: SecureMasterMainViewStatus;
  primaryMainPage: '/cmt/master/secure';
  structuredStatusPage: '/cmt/master/secure/main/view/status';
  mainViewApi: '/api/cmt/master/secure/main/view';
  recommendedUse: string[];
  sampleQuestions: string[];
  visibleFeatures: string[];
  safety: {
    localTestable: true;
    structuredMainViewVisible: true;
    statusBadgesVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterMainViewEntry(): SecureMasterMainViewEntry {
  return {
    phase: '128.2',
    label: 'Secure Master Structured Main View Entry',
    status: getSecureMasterMainViewStatus(),
    primaryMainPage: '/cmt/master/secure',
    structuredStatusPage: '/cmt/master/secure/main/view/status',
    mainViewApi: '/api/cmt/master/secure/main/view',
    recommendedUse: [
      'Hauptseite /cmt/master/secure als Standard-Testseite nutzen.',
      'Status-Badges nach jeder Frage pruefen.',
      'Bei internen Daten Privacy Gate und External-Sharing-Badge pruefen.',
      'Bei Entscheidungsfragen Gremiumskarten pruefen.',
      'Structured-Statusseite nur zur Kontrolle nutzen.',
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
    visibleFeatures: [
      'Structured Main View',
      'Status-Badges',
      'Kompakte Antwortbloecke',
      '5er-Gremium-Karten bei Bedarf',
      'Kontrollseiten-Links',
      'Safety State',
    ],
    safety: {
      localTestable: true,
      structuredMainViewVisible: true,
      statusBadgesVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 128.3: Secure Master Structured Main View Handoff',
  };
}
