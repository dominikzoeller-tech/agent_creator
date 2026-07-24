import { getSecureMasterQualityStatus, type SecureMasterQualityStatus } from './cmt-master-quality-status';

export type SecureMasterQualityEntry = {
  phase: '124.2';
  label: 'Secure Master Quality Entry';
  status: SecureMasterQualityStatus;
  primaryQualityPage: '/cmt/master/secure/quality';
  qualityStatusPage: '/cmt/master/secure/quality/status';
  secureMasterPage: '/cmt/master/secure';
  recommendedUse: string[];
  sampleQuestions: string[];
  safety: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterQualityEntry(): SecureMasterQualityEntry {
  return {
    phase: '124.2',
    label: 'Secure Master Quality Entry',
    status: getSecureMasterQualityStatus(),
    primaryQualityPage: '/cmt/master/secure/quality',
    qualityStatusPage: '/cmt/master/secure/quality/status',
    secureMasterPage: '/cmt/master/secure',
    recommendedUse: [
      'Quality-Seite fuer lokale Antworttests verwenden.',
      'Secure-Master-Hauptseite weiter als zentralen Einstieg behalten.',
      'Bei internen Daten Privacy Gate pruefen.',
      'Bei Entscheidungsfragen Gremium-Routing testen.',
      'Bei Live-Daten Toolbedarf sauber erkennen lassen.',
    ],
    sampleQuestions: [
      'Was kannst du als Master-Agent aktuell?',
      'Soll ich den Agenten live schalten?',
      'Hier sind interne Daten von Kunde Muster. Darfst du das extern verarbeiten?',
      'Soll ich das Gremium fragen?',
      'Wie ist das Wetter morgen?',
      'Baue mir einen Immobilien-Agenten.',
    ],
    safety: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 124.3: Secure Master Quality Handoff',
  };
}
