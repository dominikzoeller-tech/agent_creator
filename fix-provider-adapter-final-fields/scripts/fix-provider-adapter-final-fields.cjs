const fs = require('fs');
const path = require('path');
const root = process.cwd();
const rel = 'frontend/lib/cmt-secure-master-provider-adapter-contract.ts';
const full = path.join(root, rel);
fs.mkdirSync(path.dirname(full), { recursive: true });

const content = `export type SecureMasterProviderAdapterContract = {
  contractPrepared: true;
  adapterName: 'secure-master-provider-adapter';
  adapterDispatchAllowed: false;
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  secretsIncluded: false;
  selectedProvider: string;
  selectedModel: string;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  requestEnvelopePreview: {
    dryRunOnly: true;
    providerCallAllowed: false;
    secretsIncluded: false;
    inputPreview: string;
    approvalDecision: string;
    privacyDecision: string;
    selectedProvider: string;
    selectedModel: string;
  };
  responseEnvelopePreview: {
    ok: true;
    message: string;
    dispatchStatus: 'blocked_dry_run';
    providerCallAllowed: false;
    adapterDispatchAllowed: false;
    dryRunOnly: true;
  };
  activationRequirements: string[];
  requiredEnvLater: string[];
  forbiddenClientFields: string[];
  blockedReason: string;
  nextStep: string;
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterContract(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
  selectedProvider?: string;
  selectedModel?: string;
} = {}): SecureMasterProviderAdapterContract {
  const inputPreview = String(params.input ?? '').slice(0, 240);
  const approvalDecision = params.approvalDecision ?? 'local_only';
  const privacyDecision = params.privacyDecision ?? 'allow_local_only';
  const selectedProvider = params.selectedProvider ?? 'none';
  const selectedModel = params.selectedModel ?? 'none';
  const activationRequirements = [
    'Build muss gruen sein',
    'Worker-Ergebnis muss geladen sein',
    'Provider-Key darf nur serverseitig existieren',
    'Keine Secrets im Client oder localStorage',
    'Externe Verarbeitung nur nach expliziter Freigabe',
    'Dry-Run bleibt Default',
  ];
  const nextStep = 'Build gruen bekommen, Worker-Ergebnis laden, dann Agent-Arbeitsmodus weiter nutzen.';

  return {
    contractPrepared: true,
    adapterName: 'secure-master-provider-adapter',
    adapterDispatchAllowed: false,
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    secretsIncluded: false,
    selectedProvider,
    selectedModel,
    inputPreview,
    approvalDecision,
    privacyDecision,
    requestEnvelopePreview: {
      dryRunOnly: true,
      providerCallAllowed: false,
      secretsIncluded: false,
      inputPreview,
      approvalDecision,
      privacyDecision,
      selectedProvider,
      selectedModel,
    },
    responseEnvelopePreview: {
      ok: true,
      message: 'Provider-Adapter ist nur als Dry-Run vorbereitet. Kein externer Call.',
      dispatchStatus: 'blocked_dry_run',
      providerCallAllowed: false,
      adapterDispatchAllowed: false,
      dryRunOnly: true,
    },
    activationRequirements,
    requiredEnvLater: [
      'LIVE_TEST_ENABLED',
      'PROVIDER_ENABLED',
      'LIVE_MODEL_ENABLED',
      'EXTERNAL_SHARING_ALLOWED',
      'PROVIDER_MODEL',
      'PROVIDER_API_KEY',
    ],
    forbiddenClientFields: [
      'PROVIDER_API_KEY',
      'apiKey',
      'secret',
      'token',
      'password',
      'rawProviderCredential',
    ],
    blockedReason: 'Provider-Adapter-Contract ist vorbereitet, echter Provider-Call bleibt blockiert.',
    nextStep,
    nextSafeStep: nextStep,
  };
}

export default createSecureMasterProviderAdapterContract;
`;

fs.writeFileSync(full, content, 'utf8');
console.log('[write]', rel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/lib/cmt-secure-master-provider-adapter-contract.ts';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');for(const token of ['activationRequirements','nextStep','nextSafeStep','requestEnvelopePreview','responseEnvelopePreview','createSecureMasterProviderAdapterContract']){if(!text.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] provider adapter final fields verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-provider-adapter-final-fields.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixadapterfinal:verify'] = 'node scripts/v-fix-provider-adapter-final-fields.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixadapterfinal:verify');
console.log('[OK] provider adapter final fields fix applied');
