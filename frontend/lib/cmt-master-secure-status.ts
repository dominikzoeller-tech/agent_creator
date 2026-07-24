import { getSecureMasterDemo, type SecureMasterAgentResult } from './cmt-master-secure';

export type SecureMasterStatus = {
  phase: '122.1';
  label: 'Secure Master Agent Status';
  currentMode: 'secure-master-local-testable';
  mainPage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure';
  demo: SecureMasterAgentResult;
  capabilities: {
    masterRouterIntegrated: true;
    privacyGateIntegrated: true;
    privacyDecisionFlowIntegrated: true;
    committeeRoutingAvailable: true;
    directRoutingAvailable: true;
    toolRequiredRoutingAvailable: true;
    agentBuilderRoutingAvailable: true;
    externalSharingBlocked: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
  };
  testInputs: string[];
  nextMilestones: string[];
  safety: {
    provider: 'none';
    modelSelected: 'none';
    dryRunOnly: true;
    externalSharingAllowed: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    providerDispatchAllowed: false;
    finalDispatchBlocked: true;
  };
};

export function getSecureMasterStatus(): SecureMasterStatus {
  return {
    phase: '122.1',
    label: 'Secure Master Agent Status',
    currentMode: 'secure-master-local-testable',
    mainPage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure',
    demo: getSecureMasterDemo(),
    capabilities: {
      masterRouterIntegrated: true,
      privacyGateIntegrated: true,
      privacyDecisionFlowIntegrated: true,
      committeeRoutingAvailable: true,
      directRoutingAvailable: true,
      toolRequiredRoutingAvailable: true,
      agentBuilderRoutingAvailable: true,
      externalSharingBlocked: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
    },
    testInputs: [
      'Erklaere mir kurz, was der Master-Agent kann.',
      'Soll ich den Agenten live schalten oder erst verbessern?',
      'Hier ist eine interne Kalkulation fuer Kunde Muster. Bitte pruefen.',
      'Wie wird morgen das Wetter?',
      'Baue mir zukuenftig einen Trading-Agenten.',
      'Soll ich zur Entscheidung das Gremium fragen?',
    ],
    nextMilestones: [
      'Secure Master Agent als Haupt-Einstieg verlinken',
      'Antwortqualitaet lokal verbessern',
      'Gremium-Antworten in Secure Master sichtbarer machen',
      'Provider-Readiness erst nach stabilen lokalen Tests vorbereiten',
    ],
    safety: {
      provider: 'none',
      modelSelected: 'none',
      dryRunOnly: true,
      externalSharingAllowed: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      providerDispatchAllowed: false,
      finalDispatchBlocked: true,
    },
  };
}
