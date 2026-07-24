import { getSecureMasterMainStatus, type SecureMasterMainStatus } from './cmt-master-main-status';

export type SecureMasterMainEntry = {
  phase: '127.2';
  label: 'Secure Master Main View Entry';
  status: SecureMasterMainStatus;
  primaryMainPage: '/cmt/master/secure';
  mainStatusPage: '/cmt/master/secure/main/status';
  unifiedControlPage: '/cmt/master/secure/unified';
  visibleControlPages: string[];
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    mainPageUsesUnifiedFlow: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterMainEntry(): SecureMasterMainEntry {
  return {
    phase: '127.2',
    label: 'Secure Master Main View Entry',
    status: getSecureMasterMainStatus(),
    primaryMainPage: '/cmt/master/secure',
    mainStatusPage: '/cmt/master/secure/main/status',
    unifiedControlPage: '/cmt/master/secure/unified',
    visibleControlPages: [
      '/cmt/master/secure/main/status',
      '/cmt/master/secure/unified',
      '/cmt/master/secure/unified/status',
      '/cmt/master/secure/unified/entry',
      '/cmt/master/secure/quality',
      '/cmt/master/secure/committee',
      '/cmt/privacy',
    ],
    recommendedUse: [
      'Hauptseite /cmt/master/secure fuer normale lokale Tests verwenden.',
      'Statusseite nur zur Kontrolle verwenden.',
      'Unified-Kontrollseite nur bei Vergleich oder Debugging verwenden.',
      'Bei internen Daten das Privacy Gate Verhalten pruefen.',
      'Bei Entscheidungsfragen die Gremiumsausgabe direkt auf der Hauptseite pruefen.',
      'Provider, Internet und Live-Modell weiterhin deaktiviert lassen.',
    ],
    sampleQuestions: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Daten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    safety: {
      localTestable: true,
      mainPageUsesUnifiedFlow: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 127.3: Secure Master Main View Handoff',
  };
}
