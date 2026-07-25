const fs = require('fs');
const path = require('path');
const root = process.cwd();
const targets = [
  'frontend/lib/cmt-privacy-gate.ts',
  'frontend/app/lib/cmt-privacy-gate.ts',
];

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `export type PrivacyGateDecision = 'allow_local_only' | 'block_external';

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
`;

for (const rel of targets) write(rel, content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ${JSON.stringify(targets)}){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['selectedOption','selectedOption: blocked','PrivacyGateApproval','anonymizedPreview','containsInternalSignals','containsPersonalSignals','containsBusinessSignals','containsSecretSignals','PrivacyGateDecisionObject','finalDispatchBlocked']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] privacy gate approval selectedOption verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-privacy-gate-approval-selected-option.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacygateapproval:verify'] = 'node scripts/v-fix-privacy-gate-approval-selected-option.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacygateapproval:verify');
console.log('[OK] privacy gate approval selectedOption fix applied');
