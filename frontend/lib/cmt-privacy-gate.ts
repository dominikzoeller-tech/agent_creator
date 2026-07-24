import { askMasterAgentLocal, type MasterAgentResult } from './cmt-master';

export type PrivacyGateDecision = {
  decision: 'allow_local_only' | 'require_anonymization' | 'require_user_approval' | 'block_external';
  reason: string;
  recommendedAction: string;
};

export type PrivacyGateResult = {
  phase: '121.0';
  label: 'Privacy Gate MVP';
  input: string;
  master: MasterAgentResult;
  detected: {
    sensitivity: 'public' | 'internal' | 'confidential';
    containsInternalSignals: boolean;
    containsPersonalSignals: boolean;
    containsBusinessSignals: boolean;
    containsSecretSignals: boolean;
  };
  decision: PrivacyGateDecision;
  anonymizedPreview: string;
  approval: {
    required: boolean;
    allowedOptions: ('local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel')[];
    selectedOption: 'local_only';
  };
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function hasAny(text: string, words: string[]) {
  const q = text.toLowerCase();
  return words.some((word) => q.includes(word));
}

function redact(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/+?[0-9][0-9s().-]{6,}/g, '[PHONE_OR_NUMBER]')
    .replace(/(Kunde|Firma|Projekt|Angebot|Kalkulation)s+[^,.
]+/gi, '$1 [REDACTED]');
}

export function evaluatePrivacyGate(input: string): PrivacyGateResult {
  const normalized = input.trim() || 'Welche Daten sollen geprueft werden?';
  const master = askMasterAgentLocal(normalized);
  const containsInternalSignals = hasAny(normalized, ['intern', 'betriebsintern', 'kunde', 'projekt', 'firma']);
  const containsPersonalSignals = hasAny(normalized, ['email', '@', 'telefon', 'adresse', 'mitarbeiter', 'person']);
  const containsBusinessSignals = hasAny(normalized, ['angebot', 'kalkulation', 'preis', 'marge', 'umsatz', 'kosten']);
  const containsSecretSignals = hasAny(normalized, ['geheim', 'vertraulich', 'passwort', 'token', 'api key', 'apikey', 'secret']);
  const sensitivity = containsSecretSignals || master.privacy.sensitivity === 'confidential'
    ? 'confidential'
    : containsInternalSignals || containsPersonalSignals || containsBusinessSignals || master.privacy.sensitivity === 'internal'
      ? 'internal'
      : 'public';

  let decision: PrivacyGateDecision;
  if (sensitivity === 'confidential' || containsSecretSignals) {
    decision = {
      decision: 'block_external',
      reason: 'Vertrauliche oder geheime Inhalte erkannt. Externe Weitergabe bleibt blockiert.',
      recommendedAction: 'Lokal verarbeiten oder sensible Stellen entfernen. Keine Provider-/Internet-Weitergabe.',
    };
  } else if (sensitivity === 'internal' || containsPersonalSignals || containsBusinessSignals) {
    decision = {
      decision: 'require_anonymization',
      reason: 'Interne, personenbezogene oder geschaeftliche Signale erkannt.',
      recommendedAction: 'Vor externer Verarbeitung anonymisieren und danach explizite Freigabe einholen.',
    };
  } else {
    decision = {
      decision: 'allow_local_only',
      reason: 'Keine klar sensiblen Signale erkannt. Im aktuellen Modus dennoch nur lokale Verarbeitung.',
      recommendedAction: 'Lokal beantworten. Provider bleibt bis zur Live-Freigabe deaktiviert.',
    };
  }

  return {
    phase: '121.0',
    label: 'Privacy Gate MVP',
    input: normalized,
    master,
    detected: {
      sensitivity,
      containsInternalSignals,
      containsPersonalSignals,
      containsBusinessSignals,
      containsSecretSignals,
    },
    decision,
    anonymizedPreview: redact(normalized),
    approval: {
      required: decision.decision !== 'allow_local_only',
      allowedOptions: ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'],
      selectedOption: 'local_only',
    },
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

export function getPrivacyGateDemo() {
  return evaluatePrivacyGate('Hier ist eine interne Kalkulation fuer Kunde Muster mit Angebot 12345. Darf der Agent das pruefen?');
}
