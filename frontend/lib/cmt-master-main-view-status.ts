import { getSecureMasterMainViewDemo, type SecureMasterMainViewModel } from './cmt-master-main-view-model';

export type SecureMasterMainViewStatus = {
  phase: '128.1';
  label: 'Secure Master Structured Main View Status';
  mainPage: '/cmt/master/secure';
  mainViewApi: '/api/cmt/master/secure/main/view';
  demo: SecureMasterMainViewModel;
  viewState: {
    structuredMainViewVisible: true;
    statusBadgesVisible: true;
    compactBlocksVisible: true;
    committeeCardsReadable: true;
    controlLinksVisible: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleBadges: string[];
  visibleSections: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterMainViewStatus(): SecureMasterMainViewStatus {
  return {
    phase: '128.1',
    label: 'Secure Master Structured Main View Status',
    mainPage: '/cmt/master/secure',
    mainViewApi: '/api/cmt/master/secure/main/view',
    demo: getSecureMasterMainViewDemo(),
    viewState: {
      structuredMainViewVisible: true,
      statusBadgesVisible: true,
      compactBlocksVisible: true,
      committeeCardsReadable: true,
      controlLinksVisible: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die Secure-Master-Hauptansicht ist strukturiert. Status-Badges, kompakte Antwortbloecke und lesbare Gremiumskarten sind lokal sichtbar. Provider, Internet und Live-Modell bleiben deaktiviert.',
    },
    visibleBadges: [
      'Route',
      'Intent',
      'Privacy Gate',
      'Gremium',
      'Live Model',
      'External Sharing',
      'Network',
    ],
    visibleSections: [
      'Frage an den Secure Master',
      'Status-Badges',
      'Kompakte Antwortbloecke',
      '5er-Gremium bei Bedarf',
      'Kontrollseiten',
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
      'Structured Main View Entry ergaenzen',
      'Strukturierte Hauptansicht dokumentieren',
      'Antwortbloecke noch kompakter machen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
