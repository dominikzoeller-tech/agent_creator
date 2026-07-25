const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `export type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';
export type PrivacyGateDecision = 'allow_local_only' | 'block_external';

export type PrivacyGateDecisionObject = {
  decision: PrivacyGateDecision;
  label: string;
  reason: string;
};

export type PrivacyGateDetected = {
  sensitivity: 'none' | 'low' | 'medium' | 'high';
  matches: string[];
  hasSensitiveData: boolean;
};

export type PrivacyGateApproval = {
  required: boolean;
  reason: string;
};

export type PrivacyDecisionGate = {
  decision: PrivacyGateDecisionObject;
  detected: PrivacyGateDetected;
  approval: PrivacyGateApproval;
  sanitizedText: string;
  localOnly: boolean;
  externalSharingAllowed: boolean;
  providerEnabled: boolean;
  internetEnabled: boolean;
  liveModelEnabled: boolean;
};

export type PrivacyDecisionOutcome = {
  accepted: boolean;
  mode: PrivacyDecisionOption;
  message: string;
  nextAction: string;
};

export type PrivacyDecisionResult = {
  ok: true;
  option: PrivacyDecisionOption;
  label: string;
  input: string;
  gate: PrivacyDecisionGate;
  outcome: PrivacyDecisionOutcome;
  action: {
    selected: PrivacyDecisionOption;
    externalSendAllowed: boolean;
    anonymizeBeforeSend: boolean;
    cancelled: boolean;
  };
  finalRoute: string;
  requiresUserApproval: boolean;
  externalSharingAllowed: boolean;
  createdAt: string;
};

export const PrivacyDecisionOption = {
  local_only: 'local_only',
  anonymize_then_send: 'anonymize_then_send',
  approve_external_send: 'approve_external_send',
  cancel: 'cancel',
} as const;

const labels: Record<PrivacyDecisionOption, string> = {
  local_only: 'Lokal behalten',
  anonymize_then_send: 'Anonymisieren, dann senden',
  approve_external_send: 'Externe Weitergabe freigeben',
  cancel: 'Abbrechen',
};

const secretTerms = ['passwort', 'password', 'api key', 'apikey', 'token', 'secret', 'geheim', 'vertraulich'];
const businessTerms = ['kunde', 'firma', 'projekt', 'angebot', 'kalkulation'];

export function isPrivacyDecisionOption(value: unknown): value is PrivacyDecisionOption {
  return value === 'local_only' || value === 'anonymize_then_send' || value === 'approve_external_send' || value === 'cancel';
}

export function getPrivacyDecisionLabel(option: PrivacyDecisionOption): string {
  return labels[option] ?? option;
}

function sanitize(text: string): string {
  const value = String(text ?? '');
  if (value.includes('@') && value.includes('.')) return '[EMAIL_OR_CONTACT_REDACTED]';
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length >= 7) return '[PHONE_OR_NUMBER_REDACTED]';
  const lower = value.toLowerCase();
  if (secretTerms.some((term: string) => lower.includes(term))) return '[SENSITIVE_TERM_REDACTED]';
  if (businessTerms.some((term: string) => lower.includes(term))) return '[BUSINESS_CONTEXT_REDACTED]';
  return value;
}

function detect(text: string): PrivacyGateDetected {
  const value = String(text ?? '');
  const lower = value.toLowerCase();
  const matches: string[] = [];
  if (value.includes('@') && value.includes('.')) matches.push('email');
  if (value.replace(/[^0-9]/g, '').length >= 7) matches.push('phone_or_number');
  if (secretTerms.some((term: string) => lower.includes(term))) matches.push('secret_terms');
  if (businessTerms.some((term: string) => lower.includes(term))) matches.push('business_context');
  const sensitivity = matches.length >= 2 ? 'high' : matches.length === 1 ? 'medium' : 'none';
  return { sensitivity, matches, hasSensitiveData: matches.length > 0 };
}

function createOutcome(option: PrivacyDecisionOption, detected: PrivacyGateDetected): PrivacyDecisionOutcome {
  if (option === 'cancel') {
    return { accepted: false, mode: option, message: 'Vorgang wurde abgebrochen.', nextAction: 'Keine externe Weitergabe ausfuehren.' };
  }
  if (option === 'local_only') {
    return { accepted: true, mode: option, message: 'Lokale Verarbeitung wurde gewaehlt.', nextAction: 'Antwort lokal anzeigen und nicht extern senden.' };
  }
  if (option === 'anonymize_then_send') {
    return { accepted: true, mode: option, message: 'Anonymisierung ist erforderlich. Externe Weitergabe bleibt bis zur Freigabe blockiert.', nextAction: 'Anonymisierte Vorschau pruefen.' };
  }
  return {
    accepted: !detected.hasSensitiveData,
    mode: option,
    message: detected.hasSensitiveData ? 'Sensible Daten erkannt. Externe Weitergabe bleibt blockiert.' : 'Freigabe angefordert. Kompatibilitaetsmodus fuehrt keinen externen Call aus.',
    nextAction: 'Explizite Freigabe und Privacy-Gate pruefen.',
  };
}

export function decidePrivacyAction(input: string = '', option: PrivacyDecisionOption = 'local_only'): PrivacyDecisionResult {
  const selected = isPrivacyDecisionOption(option) ? option : 'local_only';
  const detected = detect(input);
  const blockExternal = detected.hasSensitiveData || selected === 'local_only' || selected === 'cancel';
  const gateDecision: PrivacyGateDecision = blockExternal ? 'block_external' : 'allow_local_only';

  return {
    ok: true,
    option: selected,
    label: getPrivacyDecisionLabel(selected),
    input: String(input ?? ''),
    gate: {
      decision: {
        decision: gateDecision,
        label: gateDecision === 'block_external' ? 'Externe Weitergabe blockiert' : 'Nur lokale Verarbeitung erlaubt',
        reason: blockExternal ? 'Privacy-Gate blockiert externe Weitergabe oder erzwingt lokalen Modus.' : 'Keine externe Weitergabe wird im Kompatibilitaetsmodus ausgefuehrt.',
      },
      detected,
      approval: {
        required: selected === 'approve_external_send' || selected === 'anonymize_then_send',
        reason: 'Externe Verarbeitung bleibt bis zur expliziten Freigabe blockiert.',
      },
      sanitizedText: sanitize(input),
      localOnly: true,
      externalSharingAllowed: false,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
    },
    outcome: createOutcome(selected, detected),
    action: {
      selected,
      externalSendAllowed: false,
      anonymizeBeforeSend: selected === 'anonymize_then_send',
      cancelled: selected === 'cancel',
    },
    finalRoute: '/cmt/privacy/decision',
    requiresUserApproval: selected === 'approve_external_send' || selected === 'anonymize_then_send',
    externalSharingAllowed: false,
    createdAt: new Date().toISOString(),
  };
}

export function getPrivacyDecisionDemo(): PrivacyDecisionResult {
  return decidePrivacyAction('Lokale Demo ohne echte Kundendaten.', 'local_only');
}

export default decidePrivacyAction;
`;

write('frontend/lib/cmt-privacy-decision.ts', content);
write('frontend/app/lib/cmt-privacy-decision.ts', content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-privacy-decision.ts','frontend/app/lib/cmt-privacy-decision.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['PrivacyDecisionOutcome','outcome: PrivacyDecisionOutcome','createOutcome','accepted: boolean','nextAction: string','PrivacyDecisionGate','PrivacyGateDecisionObject','decidePrivacyAction']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] privacy decision outcome field verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-privacy-decision-outcome-field.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacyoutcome:verify'] = 'node scripts/v-fix-privacy-decision-outcome-field.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacyoutcome:verify');
console.log('[OK] privacy decision outcome field fix applied');
