const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const setupLib = `export type SecureMasterProviderSetupPreview = {
  setupFormPrepared: true;
  saveEnabled: false;
  activationEnabled: false;
  noSecretPersistence: true;
  noProviderCall: true;
  fields: string[];
  warning: string;
  nextStep: string;
};

export const secureMasterProviderSetupPreview: SecureMasterProviderSetupPreview = {
  setupFormPrepared: true,
  saveEnabled: false,
  activationEnabled: false,
  noSecretPersistence: true,
  noProviderCall: true,
  fields: ['Provider', 'Model', 'API key placeholder', 'Budget/token limit', 'Approval mode'],
  warning: 'Noch keine echten API-Keys eingeben. Dieses Formular ist nur eine lokale Vorschau. Es speichert nichts und ruft keinen Provider auf.',
  nextStep: 'Als Nächstes Validierung und Freigabe-Check vorbereiten, bevor echte Provider-Werte erlaubt werden.',
};
`;
write('frontend/lib/cmt-secure-master-provider-setup-preview.ts', setupLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-setup-preview')) {
  page = page.replace(
    "import { secureMasterProviderConfig } from '../../../../../lib/cmt-secure-master-provider-config';",
    "import { secureMasterProviderConfig } from '../../../../../lib/cmt-secure-master-provider-config';\nimport { secureMasterProviderSetupPreview } from '../../../../../lib/cmt-secure-master-provider-setup-preview';"
  );
}

if (!page.includes('Provider-Setup Vorschau')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Setup Vorschau</h2>\n          <p style={{ color: '#fbbf24' }}>{secureMasterProviderSetupPreview.warning}</p>\n          <div style={{ display: 'grid', gap: 10, maxWidth: 620 }}>\n            <label>Provider <input disabled placeholder='none' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>\n            <label>Model <input disabled placeholder='none' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>\n            <label>API-Key Platzhalter <input disabled placeholder='nicht eingeben' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>\n            <label>Budget/Token-Limit <input disabled placeholder='später' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>\n          </div>\n          <p>Speichern erlaubt: <b>{String(secureMasterProviderSetupPreview.saveEnabled)}</b></p>\n          <p>Aktivieren erlaubt: <b>{String(secureMasterProviderSetupPreview.activationEnabled)}</b></p>\n          <p>Secrets persistieren: <b>{String(!secureMasterProviderSetupPreview.noSecretPersistence)}</b></p>\n          <p>Provider-Call: <b>{String(!secureMasterProviderSetupPreview.noProviderCall)}</b></p>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderSetupPreview.nextStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-setup-preview.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Setup Vorschau','secureMasterProviderSetupPreview','API-Key Platzhalter','Aktivieren erlaubt']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-7 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-7.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp7:verify'] = 'node scripts/v-mvp-agent-7.cjs';
pkg.scripts['agent:mvp7:verify'] = 'node scripts/v-mvp-agent-7.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp7:verify agent:mvp7:verify');
console.log('[OK] mvp-agent-7 applied');
