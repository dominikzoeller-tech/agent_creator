import { getSecureMasterStatus, type SecureMasterStatus } from './cmt-master-secure-status';

export type SecureMasterGuide = {
  phase: '122.2';
  label: 'Secure Master Agent Guide';
  status: SecureMasterStatus;
  openNow: string;
  quickTestSteps: string[];
  expectedBehaviors: string[];
  notYetLive: string[];
  nextBuildSteps: string[];
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

export function getSecureMasterGuide(): SecureMasterGuide {
  return {
    phase: '122.2',
    label: 'Secure Master Agent Guide',
    status: getSecureMasterStatus(),
    openNow: '/cmt/master/secure',
    quickTestSteps: [
      'Frontend starten oder laufenden Frontend-Server verwenden.',
      'http://localhost:3001/cmt/master/secure im Browser oeffnen.',
      'Eine allgemeine Frage stellen.',
      'Eine interne oder geschaeftliche Eingabe testen.',
      'Eine Entscheidungsfrage testen, bei der das Gremium sinnvoll waere.',
      'Eine Tool-Frage testen, zum Beispiel Wetter oder aktuelle Daten.',
      'Eine Spezialagenten-Frage testen, zum Beispiel Trading-Agent oder Immobilien-Agent.',
    ],
    expectedBehaviors: [
      'Unkritische Fragen werden lokal direkt geroutet.',
      'Interne oder sensible Daten werden auf privacy_gate geroutet.',
      'Entscheidungsfragen werden lokal Richtung Gremium geroutet.',
      'Aktuelle Daten werden als tool_required markiert.',
      'Agentenbau-Fragen werden als agent_builder markiert.',
      'Externe Weitergabe bleibt immer blockiert.',
      'Provider, Internet und Live-Modell bleiben deaktiviert.',
    ],
    notYetLive: [
      'Noch keine echten KI-Modell-Antworten.',
      'Noch kein Internetzugriff.',
      'Noch keine echte externe Provider-Weitergabe.',
      'Noch keine echte Desktop-Beobachtung.',
      'Noch keine produktive Spezialagenten-Erzeugung.',
    ],
    nextBuildSteps: [
      'Secure Master Agent als sichtbaren Haupt-Einstieg verlinken.',
      'Lokale Antwortqualitaet verbessern.',
      'Gremium-Antworten in Secure Master direkt anzeigen.',
      'Provider-Readiness vorbereiten, aber weiter blockiert halten.',
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
