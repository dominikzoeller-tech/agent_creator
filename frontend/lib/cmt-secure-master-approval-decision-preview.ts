export type SecureMasterApprovalDecision = 'local_only' | 'anonymize_then_send' | 'cancel';

export type SecureMasterApprovalDecisionPreview = {
  decisionPrepared: true;
  allowedDecisions: SecureMasterApprovalDecision[];
  defaultDecision: SecureMasterApprovalDecision;
  externalSendStillBlocked: true;
  noProviderCall: true;
  explanations: Record<SecureMasterApprovalDecision, string>;
  nextStep: string;
};

export const secureMasterApprovalDecisionPreview: SecureMasterApprovalDecisionPreview = {
  decisionPrepared: true,
  allowedDecisions: ['local_only', 'anonymize_then_send', 'cancel'],
  defaultDecision: 'local_only',
  externalSendStillBlocked: true,
  noProviderCall: true,
  explanations: {
    local_only: 'Daten bleiben vollständig lokal. Sicherster Modus für interne oder unklare Inhalte.',
    anonymize_then_send: 'Späterer Modus: interne Daten werden anonymisiert, danach wäre eine separate Freigabe nötig. Aktuell noch blockiert.',
    cancel: 'Abbrechen, wenn Daten zu sensibel sind oder keine Freigabe vorliegt.',
  },
  nextStep: 'Als Nächstes echte Auswahl im UI speichern, aber weiterhin keinen Provider aufrufen.',
};
