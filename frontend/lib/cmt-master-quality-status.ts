import { getSecureMasterQualityDemo, type SecureMasterQualityResult } from './cmt-master-quality';

export type SecureMasterQualityStatus = {
  phase: '124.1';
  label: 'Secure Master Quality Status';
  mainQualityPage: '/cmt/master/secure/quality';
  mainSecurePage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure/quality';
  demo: SecureMasterQualityResult;
  supportedIntents: string[];
  qualityState: {
    localAnswersImproved: true;
    intentDetectionEnabled: true;
    committeeDecisionVisible: true;
    privacyAnswerImproved: true;
    toolMissingCapabilityVisible: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterQualityStatus(): SecureMasterQualityStatus {
  return {
    phase: '124.1',
    label: 'Secure Master Quality Status',
    mainQualityPage: '/cmt/master/secure/quality',
    mainSecurePage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure/quality',
    demo: getSecureMasterQualityDemo(),
    supportedIntents: [
      'general',
      'live_switch',
      'internal_data',
      'committee_decision',
      'tool_required',
      'agent_builder',
      'project_next_step',
    ],
    qualityState: {
      localAnswersImproved: true,
      intentDetectionEnabled: true,
      committeeDecisionVisible: true,
      privacyAnswerImproved: true,
      toolMissingCapabilityVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale Antwortqualitaet ist verbessert. Der Secure Master erkennt mehrere Absichten und gibt klarere lokale Antworten ohne Provider oder Internet.',
    },
    testPrompts: [
      'Soll ich den Agenten jetzt live schalten?',
      'Hier sind interne Kundendaten. Was darfst du damit machen?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie wird morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
      'Was ist der naechste Projektschritt?',
    ],
    nextMilestones: [
      'Qualitaetslogik in Hauptseite /cmt/master/secure integrieren',
      '5er-Gremium direkt in der Secure-Master-Antwort anzeigen',
      'Antwortstruktur fuer Nutzerfragen vereinheitlichen',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
