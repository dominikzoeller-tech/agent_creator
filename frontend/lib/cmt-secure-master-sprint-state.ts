export type SecureMasterLocalApproval = 'local_only' | 'anonymize_then_send' | 'cancel';

export type SecureMasterSprintState = {
  localApprovalKey: string;
  defaultApproval: SecureMasterLocalApproval;
  providerCallAllowed: false;
  externalSendAllowed: false;
  liveModelAllowed: false;
  readinessSnapshot: {
    localAgentWorks: true;
    privacyGateVisible: true;
    approvalDecisionVisible: true;
    providerConfigVisible: true;
    providerValidationVisible: true;
    providerCallAllowed: false;
    nextMilestone: string;
  };
  quickTests: string[];
  nextActions: string[];
};

export const secureMasterSprintState: SecureMasterSprintState = {
  localApprovalKey: 'cmt.secureMaster.localApproval.v1',
  defaultApproval: 'local_only',
  providerCallAllowed: false,
  externalSendAllowed: false,
  liveModelAllowed: false,
  readinessSnapshot: {
    localAgentWorks: true,
    privacyGateVisible: true,
    approvalDecisionVisible: true,
    providerConfigVisible: true,
    providerValidationVisible: true,
    providerCallAllowed: false,
    nextMilestone: 'Provider-Gate technisch vorbereiten, aber erst nach ausdruecklicher Freigabe Live-KI aktivieren.',
  },
  quickTests: [
    'Soll ich den Master-Agenten jetzt live schalten?',
    'Hier sind interne Kundendaten aus einer Kalkulation. Was soll ich tun?',
    'Wie wird morgen das Wetter?',
    'Baue mir spaeter einen Trading-Agenten.',
    'Wie koennen wir den Agenten verbessern?',
  ],
  nextActions: [
    'Lokale Nutzung testen und Fehler sammeln',
    'Build stabil halten',
    'Freigabeentscheidung lokal speichern',
    'Provider-Gate weiter vorbereiten',
    'Erst danach echten Provider anschliessen',
  ],
};
