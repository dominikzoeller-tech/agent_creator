import { getSecureMasterUnifiedStatus, type SecureMasterUnifiedStatus } from './cmt-master-unified-status';

export type SecureMasterMainStatus = {
  phase: '127.1';
  label: 'Secure Master Main View Status';
  mainPage: '/cmt/master/secure';
  unifiedControlPage: '/cmt/master/secure/unified';
  unifiedApiRoute: '/api/cmt/master/secure/unified';
  unifiedStatus: SecureMasterUnifiedStatus;
  mainState: {
    mainPageUsesUnifiedFlow: true;
    localAnswerVisible: true;
    routingVisible: true;
    privacyGateVisibleWhenNeeded: true;
    committeeVisibleWhenNeeded: true;
    safetyStateVisible: true;
    controlPagesKept: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  controlPages: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterMainStatus(): SecureMasterMainStatus {
  return {
    phase: '127.1',
    label: 'Secure Master Main View Status',
    mainPage: '/cmt/master/secure',
    unifiedControlPage: '/cmt/master/secure/unified',
    unifiedApiRoute: '/api/cmt/master/secure/unified',
    unifiedStatus: getSecureMasterUnifiedStatus(),
    mainState: {
      mainPageUsesUnifiedFlow: true,
      localAnswerVisible: true,
      routingVisible: true,
      privacyGateVisibleWhenNeeded: true,
      committeeVisibleWhenNeeded: true,
      safetyStateVisible: true,
      controlPagesKept: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die Hauptseite /cmt/master/secure nutzt jetzt den lokalen Unified Flow. Kontrollseiten bleiben erhalten. Provider, Internet und Live-Modell sind weiterhin deaktiviert.',
    },
    controlPages: [
      '/cmt/master/secure/unified',
      '/cmt/master/secure/unified/status',
      '/cmt/master/secure/unified/entry',
      '/cmt/master/secure/quality',
      '/cmt/master/secure/committee',
      '/cmt/privacy',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Daten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Hauptansicht optisch klarer machen',
      'Antwortbloecke kompakter anzeigen',
      'Status-Badges fuer Safety und Routing ergaenzen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
