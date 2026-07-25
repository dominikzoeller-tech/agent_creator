export type CmtPrivacyDecision = {
  decision: 'allow_local_only' | 'block_external';
  hasSensitiveData: boolean;
  matches: string[];
  sanitizedText: string;
};

const secretTerms = ['passwort', 'password', 'api key', 'apikey', 'token', 'secret', 'geheim', 'vertraulich'];
const businessTerms = ['kunde', 'firma', 'projekt', 'angebot', 'kalkulation'];

function hasEmail(value: string): boolean {
  return value.includes('@') && value.includes('.');
}

function hasLongNumber(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length >= 7;
}

export function sanitizeForLocalPreview(text: string): string {
  const value = text || '';
  const lower = value.toLowerCase();
  if (hasEmail(value)) return '[EMAIL_OR_CONTACT_REDACTED]';
  if (hasLongNumber(value)) return '[PHONE_OR_NUMBER_REDACTED]';
  for (const term of secretTerms) if (lower.includes(term)) return '[SENSITIVE_TERM_REDACTED]';
  for (const term of businessTerms) if (lower.includes(term)) return '[BUSINESS_CONTEXT_REDACTED]';
  return value;
}

export function evaluateCmtPrivacyGate(text: string): CmtPrivacyDecision {
  const value = text || '';
  const lower = value.toLowerCase();
  const matches: string[] = [];
  if (hasEmail(value)) matches.push('email');
  if (hasLongNumber(value)) matches.push('phone_or_number');
  if (secretTerms.some((term) => lower.includes(term))) matches.push('secret_terms');
  if (businessTerms.some((term) => lower.includes(term))) matches.push('business_context');
  return {
    decision: matches.length > 0 ? 'block_external' : 'allow_local_only',
    hasSensitiveData: matches.length > 0,
    matches,
    sanitizedText: sanitizeForLocalPreview(value),
  };
}

export default evaluateCmtPrivacyGate;
