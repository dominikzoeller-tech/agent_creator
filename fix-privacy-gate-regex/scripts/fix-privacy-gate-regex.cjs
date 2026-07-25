const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = [
  'export type CmtPrivacyDecision = {',
  "  decision: 'allow_local_only' | 'block_external';",
  '  hasSensitiveData: boolean;',
  '  matches: string[];',
  '  sanitizedText: string;',
  '};',
  '',
  'const EMAIL_RE = new RegExp(String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}`, "gi");',
  'const PHONE_RE = new RegExp(String.raw`\\+?[0-9][0-9\\s().-]{6,}`, "g");',
  'const BUSINESS_RE = new RegExp(String.raw`(Kunde|Firma|Projekt|Angebot|Kalkulation)\\s+[^,.\\n]+`, "gi");',
  'const SECRET_RE = new RegExp(String.raw`(passwort|password|api[_ -]?key|token|secret|geheim|vertraulich)`, "gi");',
  '',
  'const sensitivePatterns: { label: string; pattern: RegExp }[] = [',
  "  { label: 'email', pattern: EMAIL_RE },",
  "  { label: 'phone_or_number', pattern: PHONE_RE },",
  "  { label: 'business_context', pattern: BUSINESS_RE },",
  "  { label: 'secret_terms', pattern: SECRET_RE },",
  '];',
  '',
  'export function sanitizeForLocalPreview(text: string): string {',
  "  let value = text || '';",
  "  value = value.replace(EMAIL_RE, '[EMAIL]');",
  "  value = value.replace(PHONE_RE, '[PHONE_OR_NUMBER]');",
  "  value = value.replace(BUSINESS_RE, '$1 [REDACTED]');",
  "  value = value.replace(SECRET_RE, '[SENSITIVE_TERM]');",
  '  return value;',
  '}',
  '',
  'export function evaluateCmtPrivacyGate(text: string): CmtPrivacyDecision {',
  '  const value = text || "";',
  '  const matches: string[] = [];',
  '  for (const item of sensitivePatterns) {',
  '    item.pattern.lastIndex = 0;',
  '    if (item.pattern.test(value)) matches.push(item.label);',
  '    item.pattern.lastIndex = 0;',
  '  }',
  '  return {',
  "    decision: matches.length > 0 ? 'block_external' : 'allow_local_only',",
  '    hasSensitiveData: matches.length > 0,',
  '    matches,',
  '    sanitizedText: sanitizeForLocalPreview(value),',
  '  };',
  '}',
  '',
  'export default evaluateCmtPrivacyGate;',
  '',
].join('\n');

write('frontend/lib/cmt-privacy-gate.ts', content);

const verify = [
  "const fs=require('fs');const path=require('path');const root=process.cwd();",
  "const rel='frontend/lib/cmt-privacy-gate.ts';const full=path.join(root,rel);",
  "let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}",
  "const text=fs.readFileSync(full,'utf8');",
  "for(const token of ['EMAIL_RE','PHONE_RE','BUSINESS_RE','SECRET_RE','evaluateCmtPrivacyGate','sanitizeForLocalPreview']){if(!text.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}}",
  "if(/pattern:\s*\//.test(text)){console.error('[bad] regex literal still present');ok=false}else console.log('[ok] no regex literals used');",
  "if(ok)console.log('[OK] privacy gate regex verify passed');process.exit(ok?0:1);"
].join('');
write('scripts/v-fix-privacy-gate-regex.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacy:verify'] = 'node scripts/v-fix-privacy-gate-regex.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacy:verify');
console.log('[OK] fix-privacy-gate-regex applied');
