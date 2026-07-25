const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const validationLib = `export type SecureMasterProviderValidationPreview = {
  validationPrepared: true;
  canValidateShape: true;
  canValidateApproval: true;
  canValidatePrivacyState: true;
  canValidateBudgetLimit: true;
  canPersistSecrets: false;
  canCallProvider: false;
  liveActivationAllowed: false;
  rules: string[];
  blockerSummary: string;
  nextStep: string;
};

export const secureMasterProviderValidationPreview: SecureMasterProviderValidationPreview = {
  validationPrepared: true,
  canValidateShape: true,
  canValidateApproval: true,
  canValidatePrivacyState: true,
  canValidateBudgetLimit: true,
  canPersistSecrets: false,
  canCallProvider: false,
  liveActivationAllowed: false,
  rules: [
    'Provider darf nicht none sein',
    'Model darf nicht none sein',
    'API-Key wird später nur über sichere Secret-Verwaltung akzeptiert',
    'Interne Daten erfordern Anonymisierung oder Freigabe',
    'Budget-/Token-Limit muss gesetzt sein',
    'Audit-Log muss aktiv sein',
    'Live-Schalter darf erst nach expliziter Freigabe aktiviert werden',
  ],
  blockerSummary: 'Live-KI ist weiterhin blockiert. Validierung ist nur vorbereitet und führt keinen Provider-Call aus.',
  nextStep: 'Als Nächstes eine echte Freigabeentscheidung im lokalen UI vorbereiten: local_only, anonymize_then_send oder cancel.',
};
`;
write('frontend/lib/cmt-secure-master-provider-validation-preview.ts', validationLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-validation-preview')) {
  page = page.replace(
    "import { secureMasterProviderSetupPreview } from '../../../../../lib/cmt-secure-master-provider-setup-preview';",
    "import { secureMasterProviderSetupPreview } from '../../../../../lib/cmt-secure-master-provider-setup-preview';\nimport { secureMasterProviderValidationPreview } from '../../../../../lib/cmt-secure-master-provider-validation-preview';"
  );
}

if (!page.includes('Provider-Validierung Vorschau')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Validierung Vorschau</h2>\n          <p style={{ color: '#fbbf24' }}>{secureMasterProviderValidationPreview.blockerSummary}</p>\n          <p>Validierung vorbereitet: <b>{String(secureMasterProviderValidationPreview.validationPrepared)}</b></p>\n          <p>Secrets speichern erlaubt: <b>{String(secureMasterProviderValidationPreview.canPersistSecrets)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterProviderValidationPreview.canCallProvider)}</b></p>\n          <p>Live-Aktivierung erlaubt: <b>{String(secureMasterProviderValidationPreview.liveActivationAllowed)}</b></p>\n          <h3>Validierungsregeln</h3>\n          <ul>{secureMasterProviderValidationPreview.rules.map((item) => <li key={item}>{item}</li>)}</ul>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderValidationPreview.nextStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-validation-preview.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Validierung Vorschau','secureMasterProviderValidationPreview','Validierungsregeln','Live-Aktivierung erlaubt']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-8 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-8.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp8:verify'] = 'node scripts/v-mvp-agent-8.cjs';
pkg.scripts['agent:mvp8:verify'] = 'node scripts/v-mvp-agent-8.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp8:verify agent:mvp8:verify');
console.log('[OK] mvp-agent-8 applied');
