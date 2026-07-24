import { getMasterAgentDemo, type MasterAgentResult } from './cmt-master';

export type MasterAgentStatus = {
  phase: '120.1';
  label: 'Master Agent Router Status';
  demo: MasterAgentResult;
  status: {
    currentMode: 'master-router-local-testable';
    mainPage: '/cmt/master';
    apiRoute: '/api/cmt/master';
    routesSupported: string[];
    canAnswerDirect: true;
    canAskCommittee: true;
    canDetectPrivacyGate: true;
    canDetectToolRequired: true;
    canDetectAgentBuilder: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    summary: string;
  };
  testQuestions: string[];
  nextMilestones: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getMasterAgentStatus(): MasterAgentStatus {
  const demo = getMasterAgentDemo();
  return {
    phase: '120.1',
    label: 'Master Agent Router Status',
    demo,
    status: {
      currentMode: 'master-router-local-testable',
      mainPage: '/cmt/master',
      apiRoute: '/api/cmt/master',
      routesSupported: ['direct', 'committee', 'privacy_gate', 'tool_required', 'agent_builder'],
      canAnswerDirect: true,
      canAskCommittee: true,
      canDetectPrivacyGate: true,
      canDetectToolRequired: true,
      canDetectAgentBuilder: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      summary: 'Der Master-Agent-Router ist lokal testbar. Er entscheidet zwischen Direktantwort, Gremium, Privacy-Gate, Toolbedarf und Spezialagenten-Idee.',
    },
    testQuestions: [
      'Erklaere mir kurz den aktuellen Stand des Projekts.',
      'Soll ich den Gremium-Agenten jetzt live schalten?',
      'Hier ist eine interne Kalkulation fuer Kunde Muster, darfst du das auswerten?',
      'Wie wird das Wetter morgen?',
      'Baue mir spaeter einen Trading-Agenten.',
      'Lohnt sich ein Immobilienbewertungs-Agent fuer uns?',
    ],
    nextMilestones: [
      'Master-Agent UI klarer mit Hauptchat verbinden',
      'Datenschutz-Gate mit Freigabe-/Anonymisierungsoption ausbauen',
      'Provider-Readiness fuer echten KI-Modell-Test vorbereiten',
      'Spezialagenten-Entwurf als eigenen Flow vorbereiten',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
