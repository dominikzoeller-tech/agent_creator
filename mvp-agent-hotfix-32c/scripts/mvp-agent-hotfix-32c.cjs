const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}
function ensureFile(rel, content) {
  if (!fs.existsSync(path.join(root, rel))) write(rel, content);
  else console.log('[exists]', rel);
}
function ensureImport(page, importLine) {
  if (page.includes(importLine)) return page;
  const lines = page.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) lastImport = i;
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  return lines.join('\n');
}
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}

ensureFile('frontend/lib/cmt-secure-master-secret-readiness.ts', `export type SecureMasterSecretReadiness = {
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
  requiredLater: ['Secret-Verwaltung ausserhalb Browser und Repo', 'lokale .env nur mit Git-Ignore-Pruefung', 'keine Anzeige echter API-Keys im UI', 'keine Speicherung echter API-Keys in localStorage', 'Audit-Log ohne Secret-Werte'],
  forbiddenNow: ['echte API-Keys in das Formular eingeben', 'API-Keys im Browser speichern', 'API-Keys ins Repository committen', 'Provider-Call ohne Freigabe ausloesen'],
  nextSafeStep: 'Secret-Preflight und Budget-Gate pruefen. Noch keine echten Secrets verwenden.',
};
`);

ensureFile('frontend/lib/cmt-secure-master-env-preflight.ts', `export const secureMasterEnvPreflight = {
  envPreflightPrepared: true,
  realSecretsAllowedNow: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredFilesLater: ['.env.local', '.gitignore', 'server-side provider config'],
  gitIgnorePatternsRequired: ['.env', '.env.*', '!.env.example', '*.key', '*secret*'],
  checks: [
    { id: 'no_real_keys', label: 'Keine echten API-Keys im UI', status: 'blocked', detail: 'Echte API-Keys duerfen aktuell nicht eingegeben werden.' },
    { id: 'no_browser_secret', label: 'Keine Secrets in localStorage', status: 'blocked', detail: 'Browser-Speicherung bleibt verboten.' },
    { id: 'gitignore', label: '.gitignore muss Secrets ausschliessen', status: 'prepared', detail: 'Vor Live-KI pruefen.' },
  ],
  nextSafeStep: 'Keine echten Secrets eintragen. Preflight technisch pruefen.',
};
`);

ensureFile('frontend/lib/cmt-secure-master-server-provider-config.ts', `export const secureMasterServerProviderConfigPreview = {
  serverConfigPrepared: true,
  providerEnabled: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  dryRunOnly: true,
  envExamplePresent: true,
  clientCanReadSecrets: false,
  requiredEnvKeys: ['PROVIDER_ENABLED','PROVIDER_NAME','PROVIDER_MODEL','PROVIDER_API_KEY','PROVIDER_DRY_RUN_ONLY','EXTERNAL_SHARING_ALLOWED','LIVE_MODEL_ENABLED'],
  forbiddenClientKeys: ['PROVIDER_API_KEY','any token or credential value'],
  nextSafeStep: 'Serverseitigen Provider-Adapter nur blockiert testen.',
};
`);

ensureFile('frontend/lib/cmt-secure-master-server-provider-dry-run.ts', `export const secureMasterServerProviderDryRunContract = {
  endpointPrepared: true,
  endpointPath: '/api/cmt/master/secure/provider/dry-run',
  method: 'POST',
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  secretsAccepted: false,
  dryRunOnly: true,
  blockedReason: 'Server-Dry-Run ist vorbereitet, echter Provider-Call bleibt blockiert.',
  nextSafeStep: 'Audit-Envelope und Live-Gate pruefen.',
};
export function createSecureMasterServerProviderDryRunEnvelope(inputPreview: string, approvalDecision: string) {
  return { ok: true, endpointPrepared: true, providerCallAllowed: false, liveModelEnabled: false, externalSharingAllowed: false, secretsAccepted: false, dryRunOnly: true, requestPreview: { inputPreview: inputPreview.slice(0,240), approvalDecision }, responsePreview: { status: 'blocked_server_dry_run', message: 'Server-Dry-Run simuliert. Kein Provider wurde aufgerufen.' }, blockedReason: secureMasterServerProviderDryRunContract.blockedReason, nextSafeStep: secureMasterServerProviderDryRunContract.nextSafeStep };
}
`);

ensureFile('frontend/lib/cmt-secure-master-server-provider-adapter-disabled.ts', `export const secureMasterServerProviderAdapterDisabled = {
  adapterPrepared: true,
  adapterEnabled: false,
  dispatchAllowed: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  secretsAccepted: false,
  endpointPath: '/api/cmt/master/secure/provider/adapter-disabled',
  blockedReason: 'Serverseitiger Provider-Adapter ist vorbereitet, aber hart deaktiviert.',
  nextSafeStep: 'Secret/Git-Preflight und Budget-Limit pruefen.',
};
export function createDisabledProviderAdapterResponse(inputPreview: string, approvalDecision: string) {
  return { ok: true, adapterPrepared: true, adapterEnabled: false, dispatchAllowed: false, providerCallAllowed: false, liveModelEnabled: false, externalSharingAllowed: false, secretsAccepted: false, requestPreview: { inputPreview: inputPreview.slice(0,240), approvalDecision }, responseEnvelope: { status: 'adapter_disabled', message: 'Adapter-Codepfad erreicht, aber sicher blockiert.' }, blockedReason: secureMasterServerProviderAdapterDisabled.blockedReason, nextSafeStep: secureMasterServerProviderAdapterDisabled.nextSafeStep };
}
`);

let page = fs.readFileSync(pagePath, 'utf8');
const imports = [
  "import { secureMasterSecretReadiness } from '../../../../../lib/cmt-secure-master-secret-readiness';",
  "import { secureMasterEnvPreflight } from '../../../../../lib/cmt-secure-master-env-preflight';",
  "import { secureMasterServerProviderConfigPreview } from '../../../../../lib/cmt-secure-master-server-provider-config';",
  "import { secureMasterServerProviderDryRunContract } from '../../../../../lib/cmt-secure-master-server-provider-dry-run';",
  "import { secureMasterServerProviderAdapterDisabled } from '../../../../../lib/cmt-secure-master-server-provider-adapter-disabled';",
];
for (const imp of imports) page = ensureImport(page, imp);
fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write]', pageRel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['secureMasterSecretReadiness','secureMasterEnvPreflight','secureMasterServerProviderConfigPreview','secureMasterServerProviderDryRunContract','secureMasterServerProviderAdapterDisabled']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}for(const rel of ['frontend/lib/cmt-secure-master-secret-readiness.ts','frontend/lib/cmt-secure-master-env-preflight.ts','frontend/lib/cmt-secure-master-server-provider-config.ts','frontend/lib/cmt-secure-master-server-provider-dry-run.ts','frontend/lib/cmt-secure-master-server-provider-adapter-disabled.ts']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing file]',rel);ok=false}else console.log('[ok file]',rel)}if(ok)console.log('[OK] hotfix32c verify passed');process.exit(ok?0:1);`;
write('scripts/v-hotfix-32c.cjs', verify);
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['hotfix32c:verify'] = 'node scripts/v-hotfix-32c.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[OK] hotfix32c applied');
