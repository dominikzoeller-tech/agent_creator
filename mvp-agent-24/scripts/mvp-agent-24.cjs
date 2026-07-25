const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const envLib = `export type SecureMasterEnvPreflight = {
  envPreflightPrepared: true;
  realSecretsAllowedNow: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  requiredFilesLater: string[];
  gitIgnorePatternsRequired: string[];
  checks: { id: string; label: string; status: 'prepared' | 'blocked'; detail: string }[];
  nextSafeStep: string;
};

export const secureMasterEnvPreflight: SecureMasterEnvPreflight = {
  envPreflightPrepared: true,
  realSecretsAllowedNow: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredFilesLater: ['.env.local', '.gitignore', 'server-side provider config'],
  gitIgnorePatternsRequired: ['.env', '.env.*', '!.env.example', '*.key', '*secret*'],
  checks: [
    { id: 'no_real_keys', label: 'Keine echten API-Keys im UI', status: 'blocked', detail: 'Echte API-Keys duerfen aktuell nicht eingegeben werden.' },
    { id: 'no_browser_secret', label: 'Keine Secrets in localStorage', status: 'blocked', detail: 'Browser-Speicherung echter Secrets bleibt verboten.' },
    { id: 'gitignore', label: '.gitignore muss Secrets ausschliessen', status: 'prepared', detail: 'Vor Live-KI muss .gitignore auf .env und Secret-Dateien geprueft werden.' },
    { id: 'env_example', label: '.env.example spaeter erlaubt', status: 'prepared', detail: 'Nur Platzhalter ohne echte Werte duerfen versioniert werden.' },
    { id: 'server_only', label: 'Provider-Key nur serverseitig', status: 'prepared', detail: 'Ein echter Provider-Key darf spaeter nur serverseitig gelesen werden.' },
  ],
  nextSafeStep: 'Als naechstes .env.example und serverseitigen Config-Stub vorbereiten. Keine echten Secrets eintragen.',
};
`;
write('frontend/lib/cmt-secure-master-env-preflight.ts', envLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-env-preflight')) {
  page = page.replace(
    "import { secureMasterSecretReadiness } from '../../../../../lib/cmt-secure-master-secret-readiness';",
    "import { secureMasterSecretReadiness } from '../../../../../lib/cmt-secure-master-secret-readiness';\nimport { secureMasterEnvPreflight } from '../../../../../lib/cmt-secure-master-env-preflight';"
  );
}

if (!page.includes('envPreflight: secureMasterEnvPreflight')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, secretReadiness: secureMasterSecretReadiness, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveReadinessMatrix, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, secretReadiness: secureMasterSecretReadiness, envPreflight: secureMasterEnvPreflight, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveReadinessMatrix, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Env-/Git-Ignore-Preflight')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Env-/Git-Ignore-Preflight</h2>\n          <p style={{ color: '#fbbf24' }}>Keine echten Secrets eintragen. Dieser Block ist nur Vorbereitung.</p>\n          <p>Env-Preflight vorbereitet: <b>{String(secureMasterEnvPreflight.envPreflightPrepared)}</b></p>\n          <p>Echte Secrets erlaubt: <b>{String(secureMasterEnvPreflight.realSecretsAllowedNow)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterEnvPreflight.providerCallAllowed)}</b></p>\n          <h3>Spaeter benoetigte Dateien</h3>\n          <ul>{secureMasterEnvPreflight.requiredFilesLater.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Git-Ignore-Patterns</h3>\n          <ul>{secureMasterEnvPreflight.gitIgnorePatternsRequired.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Preflight-Checks</h3>\n          <div style={{ display: 'grid', gap: 8 }}>\n            {secureMasterEnvPreflight.checks.map((check) => (\n              <article key={check.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 10 }}>\n                <p><b>{check.label}</b> — {check.status}</p>\n                <p style={{ color: '#94a3b8' }}>{check.detail}</p>\n              </article>\n            ))}\n          </div>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterEnvPreflight.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-env-preflight.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Env-/Git-Ignore-Preflight','secureMasterEnvPreflight','envPreflight: secureMasterEnvPreflight','Git-Ignore-Patterns','Preflight-Checks']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-24 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-24.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp24:verify'] = 'node scripts/v-mvp-agent-24.cjs';
pkg.scripts['agent:mvp24:verify'] = 'node scripts/v-mvp-agent-24.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp24:verify agent:mvp24:verify');
console.log('[OK] mvp-agent-24 applied');
