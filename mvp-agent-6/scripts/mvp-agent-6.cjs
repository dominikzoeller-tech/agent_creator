const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const configLib = `export type SecureMasterProviderConfig = {
  providerConfigPrepared: true;
  providerEnabled: false;
  selectedProvider: 'none';
  selectedModel: 'none';
  liveModelEnabled: false;
  internetEnabled: false;
  externalSharingAllowed: false;
  envKeysRequiredLater: string[];
  supportedProvidersLater: string[];
  activationBlockedReason: string;
  nextStep: string;
};

export const secureMasterProviderConfig: SecureMasterProviderConfig = {
  providerConfigPrepared: true,
  providerEnabled: false,
  selectedProvider: 'none',
  selectedModel: 'none',
  liveModelEnabled: false,
  internetEnabled: false,
  externalSharingAllowed: false,
  envKeysRequiredLater: ['PROVIDER_NAME', 'MODEL_NAME', 'PROVIDER_API_KEY'],
  supportedProvidersLater: ['Azure OpenAI', 'OpenAI-compatible endpoint', 'Local model later'],
  activationBlockedReason: 'Live-KI bleibt gesperrt, bis Build stabil, Privacy-Gate bestätigt, Freigabe-Flow sichtbar und Kosten-/Token-Limit definiert sind.',
  nextStep: 'Als Nächstes Provider-Setup-Form vorbereiten, aber Werte noch nicht speichern und keinen Provider aufrufen.',
};
`;
write('frontend/lib/cmt-secure-master-provider-config.ts', configLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-provider-config')) {
  page = page.replace(
    "import { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';",
    "import { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';\nimport { secureMasterProviderConfig } from '../../../../../lib/cmt-secure-master-provider-config';"
  );
}

if (!page.includes('Provider-Konfiguration')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Provider-Konfiguration</h2>\n          <p style={{ color: '#cbd5e1' }}>Vorbereitet, aber blockiert. Es wird kein Provider aufgerufen.</p>\n          <p>Provider aktiv: <b>{String(secureMasterProviderConfig.providerEnabled)}</b></p>\n          <p>Ausgewählter Provider: <b>{secureMasterProviderConfig.selectedProvider}</b></p>\n          <p>Ausgewähltes Modell: <b>{secureMasterProviderConfig.selectedModel}</b></p>\n          <p>Blockadegrund: {secureMasterProviderConfig.activationBlockedReason}</p>\n          <p>Nächster Schritt: {secureMasterProviderConfig.nextStep}</p>\n          <h3>Spätere ENV-Keys</h3>\n          <ul>{secureMasterProviderConfig.envKeysRequiredLater.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Spätere Provider-Optionen</h3>\n          <ul>{secureMasterProviderConfig.supportedProvidersLater.map((item) => <li key={item}>{item}</li>)}</ul>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-config.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Provider-Konfiguration','secureMasterProviderConfig','PROVIDER_API_KEY','Provider aktiv']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-6 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-6.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp6:verify'] = 'node scripts/v-mvp-agent-6.cjs';
pkg.scripts['agent:mvp6:verify'] = 'node scripts/v-mvp-agent-6.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp6:verify agent:mvp6:verify');
console.log('[OK] mvp-agent-6 applied');
