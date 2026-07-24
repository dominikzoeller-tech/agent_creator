import { getCommitteeAskDemo, type CommitteeAskResult } from './cmt-ask';

export type CommitteeAskStatus = {
  phase: '119.2';
  label: 'Gremium Ask Status';
  askDemo: CommitteeAskResult;
  status: {
    currentMode: 'local-testable-plus';
    canAskQuestions: true;
    usesFiveMemberCommittee: true;
    questionIntentDetection: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    internalDataProtectionRequired: true;
    nextMilestone: 'master-router';
    openPage: '/cmt/ask';
    summary: string;
  };
  testQuestions: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeAskStatus(): CommitteeAskStatus {
  const askDemo = getCommitteeAskDemo();
  return {
    phase: '119.2',
    label: 'Gremium Ask Status',
    askDemo,
    status: {
      currentMode: 'local-testable-plus',
      canAskQuestions: true,
      usesFiveMemberCommittee: true,
      questionIntentDetection: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      internalDataProtectionRequired: true,
      nextMilestone: 'master-router',
      openPage: '/cmt/ask',
      summary: 'Der Gremium-Agent ist lokal testbar plus. Er erkennt Fragetypen und nutzt ein 5er-Gremium, ist aber noch nicht live mit KI-Modell.',
    },
    testQuestions: [
      'Wie wird das Wetter morgen?',
      'Soll ich den Gremium-Agenten jetzt live schalten?',
      'Hier sind interne Kundendaten, darfst du das prüfen?',
      'Kannst du einen Immobilienbewertungs-Agenten bauen?',
      'Was ist der nächste Schritt im Projekt?',
      'Lohnt sich diese Entscheidung für mein Unternehmen?',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
