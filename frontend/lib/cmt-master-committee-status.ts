import { getSecureMasterCommitteeDemo, type SecureMasterCommitteeResult } from './cmt-master-committee';

export type SecureMasterCommitteeStatus = {
  phase: '125.1';
  label: 'Secure Master Committee Status';
  mainCommitteePage: '/cmt/master/secure/committee';
  mainQualityPage: '/cmt/master/secure/quality';
  apiRoute: '/api/cmt/master/secure/committee';
  demo: SecureMasterCommitteeResult;
  committeeState: {
    integratedInSecureMaster: true;
    fiveRolesVisible: true;
    localOnly: true;
    decisionQuestionsDetected: true;
    finalRecommendationVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  roles: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  return {
    phase: '125.1',
    label: 'Secure Master Committee Status',
    mainCommitteePage: '/cmt/master/secure/committee',
    mainQualityPage: '/cmt/master/secure/quality',
    apiRoute: '/api/cmt/master/secure/committee',
    demo: getSecureMasterCommitteeDemo(),
    committeeState: {
      integratedInSecureMaster: true,
      fiveRolesVisible: true,
      localOnly: true,
      decisionQuestionsDetected: true,
      finalRecommendationVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Das 5er-Gremium ist lokal in den Secure Master integriert. Es zeigt Rollen, Zusammenfassung und Empfehlung, ohne Provider oder Internet zu nutzen.',
    },
    roles: [
      'Visionär',
      'Skeptiker',
      'Umsetzer',
      'Datenschutz & Risiko',
      'Wirtschaftlichkeit & Praxisnutzen',
    ],
    testPrompts: [
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Soll ich fuer diese Produktentscheidung das Gremium fragen?',
      'Welche Risiken hat der naechste Projektschritt?',
      'Ist diese interne Kundensache sicher extern nutzbar?',
      'Soll ich erst weiter lokal testen oder Provider vorbereiten?',
    ],
    nextMilestones: [
      'Gremiumsausgabe in Hauptseite /cmt/master/secure integrieren',
      'Rollenantworten etwas spezifischer pro Intent machen',
      'Gremiumsempfehlung klarer priorisieren',
      'Provider-Readiness weiter blockiert vorbereiten',
    ],
  };
}
