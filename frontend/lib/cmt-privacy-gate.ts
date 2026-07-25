export type PrivacyGateDecision = 'allow_local_only' | 'block_external';

export type PrivacyGateDecisionObject = {
  decision: PrivacyGateDecision;
  reason: string;
  recommendedAction: string;
  label: string;
};

export type PrivacyGateDetected = {
  sensitivity: 'none' | 'low' | 'medium' | 'high';
  matches: string[];
  hasSensitiveData: boolean;
  containsInternalSignals: boolean;
  containsPersonalSignals: boolean;
  containsBusinessSignals: boolean;
  containsSecretSignals: boolean;
};

export type PrivacyGateApproval = {
  required: boolean;
  selectedOption: 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';
  reason: string;
};

export type PrivacyGateResult = {
  ok: true;
  decision: PrivacyGateDecisionObject;
  detected: PrivacyGateDetected;
  approval: PrivacyGateApproval;
  hasSensitiveData: boolean;
  matches: string[];
  sanitizedText: string;
  safePayloadPreview: string;
  anonymizedPreview: string;
  localOnly: true;
  externalSharingAllowed: false;
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  providerDispatchAllowed: false;
  networkCallAllowed: false;
  finalDispatchBlocked: true;
  reason: string;
};

export type CmtPrivacyDecision = PrivacyGateResult;

const secretTerms = ['passwort', 'password', 'api key', 'apikey', 'token', 'secret', 'geheim', 'vertraulich'];
const businessTerms = ['kunde', 'firma', 'projekt', 'angebot', 'kalkulation'];
const internalTerms = ['intern', 'internal', 'confidential', 'vertraulich', 'nicht teilen'];

function hasEmail(value: string): boolean {
  return value.includes('@') && value.includes('.');
}

function hasLongNumber(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length >= 7;
}

export function sanitizeForLocalPreview(text: string): string {
  const value = String(text ?? '');
  const lower = value.toLowerCase();
  if (hasEmail(value)) return '[EMAIL_OR_CONTACT_REDACTED]';
  if (hasLongNumber(value)) return '[PHONE_OR_NUMBER_REDACTED]';
  for (const term of secretTerms) if (lower.includes(term)) return '[SENSITIVE_TERM_REDACTED]';
  for (const term of businessTerms) if (lower.includes(term)) return '[BUSINESS_CONTEXT_REDACTED]';
  return value;
}

function detect(text: string): PrivacyGateDetected {
  const value = String(text ?? '');
  const lower = value.toLowerCase();
  const matches: string[] = [];
  const containsPersonalSignals = hasEmail(value) || hasLongNumber(value);
  const containsSecretSignals = secretTerms.some((term: string) => lower.includes(term));
  const containsBusinessSignals = businessTerms.some((term: string) => lower.includes(term));
  const containsInternalSignals = internalTerms.some((term: string) => lower.includes(term));

  if (hasEmail(value)) matches.push('email');
  if (hasLongNumber(value)) matches.push('phone_or_number');
  if (containsSecretSignals) matches.push('secret_terms');
  if (containsBusinessSignals) matches.push('business_context');
  if (containsInternalSignals) matches.push('internal_context');

  const sensitivity = matches.length >= 2 ? 'high' : matches.length === 1 ? 'medium' : 'none';
  return {
    sensitivity,
    matches,
    hasSensitiveData: matches.length > 0,
    containsInternalSignals,
    containsPersonalSignals,
    containsBusinessSignals,
    containsSecretSignals,
  };
}

export function evaluateCmtPrivacyGate(text: string = ''): PrivacyGateResult {
  const value = String(text ?? '');
  const detected = detect(value);
  const blocked = detected.hasSensitiveData;
  const decisionValue: PrivacyGateDecision = blocked ? 'block_external' : 'allow_local_only';
  const reason = blocked
    ? 'Sensitive or business context detected. External sharing remains blocked.'
    : 'No sensitive indicators detected. Local-only processing remains active.';
  const sanitizedText = sanitizeForLocalPreview(value);

  return {
    ok: true,
    decision: {
      decision: decisionValue,
      label: decisionValue === 'block_external' ? 'Externe Weitergabe blockiert' : 'Nur lokale Verarbeitung erlaubt',
      reason,
      recommendedAction: blocked ? 'Lokal bleiben oder zuerst anonymisieren.' : 'Lokal verarbeiten und keine externe Weitergabe starten.',
    },
    detected,
    approval: {
      required: blocked,
      selectedOption: blocked ? 'anonymize_then_send' : 'local_only',
      reason: blocked ? 'Sensible Inhalte erfordern Freigabe/Anonymisierung.' : 'Keine externe Freigabe erforderlich, da lokal verarbeitet wird.',
    },
    hasSensitiveData: detected.hasSensitiveData,
    matches: detected.matches,
    sanitizedText,
    safePayloadPreview: sanitizedText,
    anonymizedPreview: sanitizedText,
    localOnly: true,
    externalSharingAllowed: false,
    providerEnabled: false,
    internetEnabled: false,
    liveModelEnabled: false,
    providerDispatchAllowed: false,
    networkCallAllowed: false,
    finalDispatchBlocked: true,
    reason,
  };
}

export const evaluatePrivacyGate = evaluateCmtPrivacyGate;

export function getPrivacyGateDemo(): PrivacyGateResult & { demo: true; input: string } {
  const input = 'Lokale Demo ohne echte Kundendaten.';
  return {
    demo: true,
    input,
    ...evaluateCmtPrivacyGate(input),
  };
}

export default evaluateCmtPrivacyGate;
