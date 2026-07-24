import { getSecureMasterUnifiedStatus, type SecureMasterUnifiedStatus } from './cmt-master-unified-status';

export type SecureMasterUnifiedEntry = {
  phase: '126.2';
  label: 'Secure Master Unified Entry';
  status: SecureMasterUnifiedStatus;
  primaryUnifiedPage: '/cmt/master/secure/unified';
  unifiedStatusPage: '/cmt/master/secure/unified/status';
  secureMasterPage: '/cmt/master/secure';
  committeePage: '/cmt/master/secure/committee';
  qualityPage: '/cmt/master/secure/quality';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    unifiedFlowVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterUnifiedEntry(): SecureMasterUnifiedEntry {
  return {
    phase: '126.2',
    label: 'Secure Master Unified Entry',
    status: getSecureMasterUnifiedStatus(),
    primaryUnifiedPage: '/cmt/master/secure/unified',
    unifiedStatusPage: '/cmt/master/secure/unified/status',
    secureMasterPage: '/cmt/master/secure',
    committeePage: '/cmt/master/secure/committee',
    qualityPage: '/cmt/master/secure/quality',
    recommendedUse: [
      'Unified-Seite fuer zentrale lokale Tests verwenden.',
      'Secure-Master-Hauptseite bleibt der spaetere zentrale Einstieg.',
      'Quality- und Committee-Seiten als Kontrollseiten behalten.',
      'Bei internen Daten Privacy Gate Verhalten pruefen.',
      'Bei Entscheidungsfragen Gremiumsausgabe im Unified Flow pruefen.',
      'Keine Live-Schaltung ohne separate Freigabe.',
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
      unifiedFlowVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 126.3: Secure Master Unified Handoff',
  };
}
