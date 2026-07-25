const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `export type PrivacyGateDecision = 'allow_local_only' | 'block_external';

export type PrivacyGateResult = {
  decision: PrivacyGateDecision;
  hasSensitiveData: boolean;
  matches: string[];
  sanitizedText: string;
  localOnly: boolean;
  externalSharingAllowed: boolean;
  providerEnabled: boolean;
  internetEnabled: boolean;
  liveModelEnabled: boolean;
  reason: string;
};

export type CmtPrivacyDecision = PrivacyGateResult;

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

export function evaluateCmtPrivacyGate(text: string): PrivacyGateResult {
  const value = text || '';
  const lower = value.toLowerCase();
  const matches: string[] = [];
  if (hasEmail(value)) matches.push('email');
  if (hasLongNumber(value)) matches.push('phone_or_number');
  if (secretTerms.some((term: string) => lower.includes(term))) matches.push('secret_terms');
  if (businessTerms.some((term: string) => lower.includes(term))) matches.push('business_context');
  const blocked = matches.length > 0;
  return {
    decision: blocked ? 'block_external' : 'allow_local_only',
    hasSensitiveData: blocked,
    matches,
    sanitizedText: sanitizeForLocalPreview(value),
    localOnly: true,
    externalSharingAllowed: false,
    providerEnabled: false,
    internetEnabled: false,
    liveModelEnabled: false,
    reason: blocked ? 'Sensitive or business context detected. External sharing remains blocked.' : 'No sensitive indicators detected. Local-only processing remains active.',
  };
}

export const evaluatePrivacyGate = evaluateCmtPrivacyGate;

export function getPrivacyGateDemo(): PrivacyGateResult & { ok: true; demo: true; input: string } {
  const input = 'Lokale Demo ohne echte Kundendaten.';
  return {
    ok: true,
    demo: true,
    input,
    ...evaluateCmtPrivacyGate(input),
  };
}

export default evaluateCmtPrivacyGate;
`;

write('frontend/lib/cmt-privacy-gate.ts', content);
write('frontend/app/lib/cmt-privacy-gate.ts', content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-privacy-gate.ts','frontend/app/lib/cmt-privacy-gate.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['export type PrivacyGateResult','export type CmtPrivacyDecision','evaluatePrivacyGate','evaluateCmtPrivacyGate','getPrivacyGateDemo','sanitizeForLocalPreview']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] privacy gate result type verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-privacy-gate-result-type.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacygateresult:verify'] = 'node scripts/v-fix-privacy-gate-result-type.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacygateresult:verify');
console.log('[OK] privacy gate result type fix applied');
