import { getSecureMasterCommitteeStatus, type SecureMasterCommitteeStatus } from './cmt-master-committee-status';

export type SecureMasterCommitteeEntry = {
  phase: '125.2';
  label: 'Secure Master Committee Entry';
  status: SecureMasterCommitteeStatus;
  primaryCommitteePage: '/cmt/master/secure/committee';
  committeeStatusPage: '/cmt/master/secure/committee/status';
  secureMasterPage: '/cmt/master/secure';
  qualityPage: '/cmt/master/secure/quality';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    fiveRolesVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterCommitteeEntry(): SecureMasterCommitteeEntry {
  return {
    phase: '125.2',
    label: 'Secure Master Committee Entry',
    status: getSecureMasterCommitteeStatus(),
    primaryCommitteePage: '/cmt/master/secure/committee',
    committeeStatusPage: '/cmt/master/secure/committee/status',
    secureMasterPage: '/cmt/master/secure',
    qualityPage: '/cmt/master/secure/quality',
    recommendedUse: [
      'Committee-Seite fuer Entscheidungsfragen verwenden.',
      'Bei Gremiumsfragen die 5 Rollen und finale Empfehlung pruefen.',
      'Bei internen Daten weiterhin Privacy Gate beachten.',
      'Bei Live-Schaltung immer lokale Tests und separate Freigabe priorisieren.',
      'Secure-Master-Hauptseite bleibt zentraler Einstieg.',
    ],
    sampleQuestions: [
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Welche Risiken hat die naechste Projektphase?',
      'Soll ich Provider vorbereiten oder lokal weiter testen?',
      'Wie bewertet das Gremium interne Kundendaten?',
    ],
    safety: {
      localTestable: true,
      fiveRolesVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 125.3: Secure Master Committee Handoff',
  };
}
