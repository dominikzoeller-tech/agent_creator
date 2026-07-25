const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const targets = [
  'frontend/lib/cmt-privacy-decision.ts',
  'frontend/app/lib/cmt-privacy-decision.ts'
];

const typeLine = "export type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';";
const fallback = `${typeLine}

export const privacyDecisionOptions: PrivacyDecisionOption[] = [
  'local_only',
  'anonymize_then_send',
  'approve_external_send',
  'cancel',
];

export function isPrivacyDecisionOption(value: string): value is PrivacyDecisionOption {
  return (privacyDecisionOptions as string[]).includes(value);
}

export function getPrivacyDecisionLabel(value: PrivacyDecisionOption): string {
  switch (value) {
    case 'local_only': return 'Lokal behalten';
    case 'anonymize_then_send': return 'Anonymisieren, dann senden';
    case 'approve_external_send': return 'Externe Verarbeitung freigeben';
    case 'cancel': return 'Abbrechen';
    default: return value;
  }
}

export default privacyDecisionOptions;
`;

for (const rel of targets) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    write(rel, fallback);
    continue;
  }
  let text = fs.readFileSync(full, 'utf8');
  if (!/export\s+type\s+PrivacyDecisionOption\b/.test(text)) {
    text = typeLine + '\n' + text;
    fs.writeFileSync(full, text, 'utf8');
    console.log('[patch]', rel);
  } else {
    console.log('[ok]', rel);
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-privacy-decision.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');if(!/export\\s+type\\s+PrivacyDecisionOption\\b/.test(text)){console.error('[missing type]',rel);ok=false}else console.log('[ok type]',rel)}if(ok)console.log('[OK] privacy decision type verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-privacy-decision-type.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacytype:verify'] = 'node scripts/v-fix-privacy-decision-type.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacytype:verify');
console.log('[OK] fix-privacy-decision-type applied');
