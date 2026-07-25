const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const secretLib = `export type SecureMasterSecretReadiness = {
  secretManagementPrepared: true;
  secretInputAllowed: false;
  browserSecretStorageAllowed: false;
  repoSecretStorageAllowed: false;
  envFileSecretStorageAllowedLater: boolean;
  secureVaultRequiredLater: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  requiredLater: string[];
  forbiddenNow: string[];
  nextSafeStep: string;
};

export const secureMasterSecretReadiness: SecureMasterSecretReadiness = {
  secretManagementPrepared: true,
  secretInputAllowed: false,
  browserSecretStorageAllowed: false,
  repoSecretStorageAllowed: false,
  envFileSecretStorageAllowedLater: false,
  secureVaultRequiredLater: true,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredLater: [
    'Secret-Verwaltung ausserhalb Browser und Repo',
    'lokale .env nur mit klarer Git-Ignore-Pruefung',
    'keine Anzeige echter API-Keys im UI',
    'keine Speicherung echter API-Keys in localStorage',
    'Rotation/Reset-Moeglichkeit fuer Provider-Key',
    'Audit-Log ohne Secret-Werte',
  ],
  forbiddenNow: [
    'echte API-Keys in das Formular eingeben',
    'API-Keys im Browser speichern',
    'API-Keys ins Repository committen',
    'Provider-Call ohne Freigabe ausloesen',
    'interne Daten ohne Anonymisierung extern senden',
  ],
  nextSafeStep: 'Als naechstes Secret-Preflight und Git-Ignore-Pruefung vorbereiten. Noch keine echten Secrets verwenden.',
};
`;
write('frontend/lib/cmt-secure-master-secret-readiness.ts', secretLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-secret-readiness')) {
  page = page.replace(
    "import { createSecureMasterLiveReadinessMatrix } from '../../../../../lib/cmt-secure-master-live-readiness-matrix';",
    "import { createSecureMasterLiveReadinessMatrix } from '../../../../../lib/cmt-secure-master-live-readiness-matrix';\nimport { secureMasterSecretReadiness } from '../../../../../lib/cmt-secure-master-secret-readiness';"
  );
}

if (!page.includes('secretReadiness: secureMasterSecretReadiness')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveReadinessMatrix, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), workState: secureMasterWorkState, secretReadiness: secureMasterSecretReadiness, approvalDecision: approval, operatorPanel, decisionSummary, actionPlan, liveReadinessMatrix, liveGate: secureMasterLiveGateCheck, providerAdapterPipeline, providerAdapterContract, providerDryRun: dryRunResult, adapterDryRun, adapterDryRunHistory, dryRunHistory, logs };"
  );
}

if (!page.includes('Secret-/API-Key-Sicherheit')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Secret-/API-Key-Sicherheit</h2>\n          <p style={{ color: '#fbbf24' }}>Noch keine echten API-Keys eingeben, speichern oder verwenden.</p>\n          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>\n            <p>Secret-Eingabe erlaubt: <b>{String(secureMasterSecretReadiness.secretInputAllowed)}</b></p>\n            <p>Browser-Speicherung erlaubt: <b>{String(secureMasterSecretReadiness.browserSecretStorageAllowed)}</b></p>\n            <p>Repo-Speicherung erlaubt: <b>{String(secureMasterSecretReadiness.repoSecretStorageAllowed)}</b></p>\n            <p>Secure Vault spaeter noetig: <b>{String(secureMasterSecretReadiness.secureVaultRequiredLater)}</b></p>\n            <p>Provider-Call erlaubt: <b>{String(secureMasterSecretReadiness.providerCallAllowed)}</b></p>\n          </div>\n          <h3>Jetzt verboten</h3>\n          <ul>{secureMasterSecretReadiness.forbiddenNow.map((item) => <li key={item}>{item}</li>)}</ul>\n          <h3>Spaeter erforderlich</h3>\n          <ul>{secureMasterSecretReadiness.requiredLater.map((item) => <li key={item}>{item}</li>)}</ul>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterSecretReadiness.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-secret-readiness.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Secret-/API-Key-Sicherheit','secureMasterSecretReadiness','secretReadiness: secureMasterSecretReadiness','Jetzt verboten','Spaeter erforderlich']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-23 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-23.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp23:verify'] = 'node scripts/v-mvp-agent-23.cjs';
pkg.scripts['agent:mvp23:verify'] = 'node scripts/v-mvp-agent-23.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp23:verify agent:mvp23:verify');
console.log('[OK] mvp-agent-23 applied');
