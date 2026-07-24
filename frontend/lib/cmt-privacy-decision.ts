import { evaluatePrivacyGate, type PrivacyGateResult } from './cmt-privacy-gate';

export type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';

export type PrivacyDecisionResult = {
  phase: '121.2';
  label: 'Privacy Gate Decision Flow';
  input: string;
  requestedOption: PrivacyDecisionOption;
  gate: PrivacyGateResult;
  outcome: {
    accepted: boolean;
    mode: 'local_only' | 'anonymized_preview_only' | 'blocked' | 'cancelled';
    message: string;
    nextAction: string;
  };
  safePayloadPreview: string;
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function decidePrivacyAction(input: string, option: PrivacyDecisionOption): PrivacyDecisionResult {
  const gate = evaluatePrivacyGate(input);
  let outcome: PrivacyDecisionResult['outcome'];

  if (option === 'cancel') {
    outcome = {
      accepted: true,
      mode: 'cancelled',
      message: 'Vorgang abgebrochen. Keine Verarbeitung und keine Weitergabe.',
      nextAction: 'Eingabe ueberarbeiten oder lokal neu pruefen.',
    };
  } else if (option === 'local_only') {
    outcome = {
      accepted: true,
      mode: 'local_only',
      message: 'Nur lokale Verarbeitung ausgewaehlt. Keine Provider- oder Internet-Weitergabe.',
      nextAction: 'Master-Agent darf lokal antworten oder das lokale Gremium nutzen.',
    };
  } else if (option === 'anonymize_then_send') {
    outcome = {
      accepted: true,
      mode: 'anonymized_preview_only',
      message: 'Anonymisierung vorbereitet. Externe Weitergabe bleibt im aktuellen Modus trotzdem blockiert.',
      nextAction: 'Anonymisierte Vorschau pruefen. Live-Provider erst spaeter nach separater Freigabe aktivieren.',
    };
  } else {
    outcome = {
      accepted: false,
      mode: 'blocked',
      message: 'Direkte externe Freigabe ist in Phase 121.2 noch blockiert.',
      nextAction: 'Stattdessen local_only oder anonymize_then_send waehlen.',
    };
  }

  return {
    phase: '121.2',
    label: 'Privacy Gate Decision Flow',
    input: gate.input,
    requestedOption: option,
    gate,
    outcome,
    safePayloadPreview: option === 'anonymize_then_send' ? gate.anonymizedPreview : gate.input,
    externalSharingAllowed: false,
    liveModelEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getPrivacyDecisionDemo() {
  return decidePrivacyAction('Interne Kalkulation fuer Kunde Muster mit E-Mail test@example.com und Angebot 12345.', 'anonymize_then_send');
}
