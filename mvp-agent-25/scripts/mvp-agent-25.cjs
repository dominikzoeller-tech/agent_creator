const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const envExample = `# Secure Master Provider Configuration Example
# DO NOT put real secrets into this file.
# Copy to .env.local later only after Secret Readiness is complete.

PROVIDER_ENABLED=false
PROVIDER_NAME=none
PROVIDER_MODEL=none
PROVIDER_API_KEY=replace_later_do_not_commit
PROVIDER_BASE_URL=
PROVIDER_TIMEOUT_MS=30000
PROVIDER_MAX_TOKENS=1000
PROVIDER_DRY_RUN_ONLY=true
EXTERNAL_SHARING_ALLOWED=false
LIVE_MODEL_ENABLED=false
`;
write('.env.example', envExample);

const configLib = `export type SecureMasterServerProviderConfigPreview = {
  serverConfigPrepared: true;
  providerEnabled: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  dryRunOnly: true;
  envExamplePresent: true;
  clientCanReadSecrets: false;
  requiredEnvKeys: string[];
  forbiddenClientKeys: string[];
  nextSafeStep: string;
};

export const secureMasterServerProviderConfigPreview: SecureMasterServerProviderConfigPreview = {
  serverConfigPrepared: true,
  providerEnabled: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  dryRunOnly: true,
  envExamplePresent: true,
  clientCanReadSecrets: false,
  requiredEnvKeys: [
    'PROVIDER_ENABLED',
    'PROVIDER_NAME',
    'PROVIDER_MODEL',
    'PROVIDER_API_KEY',
    'PROVIDER_DRY_RUN_ONLY',
    'EXTERNAL_SHARING_ALLOWED',
    'LIVE_MODEL_ENABLED',
  ],
  forbiddenClientKeys: [
    'PROVIDER_API_KEY',
    'PROVIDER_BASE_URL with secret query params',
    'any token or credential value',
  ],
  nextSafeStep: 'Als naechstes serverseitigen Provider-Adapter als blockierten Dry-Run-Endpunkt vorbereiten. Noch keine echten Secrets verwenden.',
};
`;
write('frontend/lib/cmt-secure-master-server-provider-config.ts', configLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-server-provider-config')) {
  page = page.replace(
    "import { secureMasterEnvPreflight } from '../../../../../lib/cmt-secure-master-env-preflight';",
    "import { secureMasterEnvPreflight } from '../../../../../lib/cmt-secure-master-env-preflight';\nimport { secureMasterServerProviderConfigPreview } from '../../../../../lib/cmt-secure-master-server-provider-config';"
  );
}

if (!page.includes('serverProviderConfigPreview: secureMasterServerProviderConfigPreview')) {
  page = page.replace(
    "envPreflight: secureMasterEnvPreflight,",
    "envPreflight: secureMasterEnvPreflight, serverProviderConfigPreview: secureMasterServerProviderConfigPreview,"
  );
}

if (!page.includes('Serverseitiger Provider-Config-Stub')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #38bdf8', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Serverseitiger Provider-Config-Stub</h2>\n          <p style={{ color: '#cbd5e1' }}>Die Provider-Konfiguration ist nur als blockierter Server-Stub vorbereitet. Der Client liest keine echten Secrets.</p>\n          <p>Server-Config vorbereitet: <b>{String(secureMasterServerProviderConfigPreview.serverConfigPrepared)}</b></p>\n          <p>Provider aktiv: <b>{String(secureMasterServerProviderConfigPreview.providerEnabled)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterServerProviderConfigPreview.providerCallAllowed)}</b></p>\n          <p>Live-Modell aktiv: <b>{String(secureMasterServerProviderConfigPreview.liveModelEnabled)}</b></p>\n          <p>Client kann Secrets lesen: <b>{String(secureMasterServerProviderConfigPreview.clientCanReadSecrets)}</b></p>\n          <h3>Erforderliche ENV-Keys spaeter</h3>\n          <ul>{secureMasterServerProviderConfigPreview.requiredEnvKeys.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Im Client verboten</h3>\n          <ul>{secureMasterServerProviderConfigPreview.forbiddenClientKeys.map((item) => <li key={item}>{item}</li>)}</ul>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterServerProviderConfigPreview.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['.env.example','frontend/lib/cmt-secure-master-server-provider-config.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Serverseitiger Provider-Config-Stub','secureMasterServerProviderConfigPreview','serverProviderConfigPreview','Client kann Secrets lesen','Erforderliche ENV-Keys spaeter']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-25 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-25.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp25:verify'] = 'node scripts/v-mvp-agent-25.cjs';
pkg.scripts['agent:mvp25:verify'] = 'node scripts/v-mvp-agent-25.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp25:verify agent:mvp25:verify');
console.log('[OK] mvp-agent-25 applied');
