const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

function ensureImport(text, line) {
  if (text.includes(line)) return text;
  const lines = text.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, line);
  else lines.unshift(line);
  return lines.join('\n');
}

const libRel = 'frontend/lib/cmt-secure-master-provider-adapter-contract.ts';
const libContent = `export type SecureMasterProviderAdapterContract = {
  contractPrepared: true;
  adapterName: 'secure-master-provider-adapter';
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  blockedReason: string;
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterContract(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
} = {}): SecureMasterProviderAdapterContract {
  return {
    contractPrepared: true,
    adapterName: 'secure-master-provider-adapter',
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    inputPreview: String(params.input ?? '').slice(0, 240),
    approvalDecision: params.approvalDecision ?? 'local_only',
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    blockedReason: 'Provider-Adapter-Contract ist vorbereitet, echter Provider-Call bleibt blockiert.',
    nextSafeStep: 'Arbeitsmodus und Worker weiter stabilisieren. Live-Call nur nach expliziter Freigabe.',
  };
}

export default createSecureMasterProviderAdapterContract;
`;
write(libRel, libContent);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');
page = ensureImport(page, "import { createSecureMasterProviderAdapterContract } from '../../../../../lib/cmt-secure-master-provider-adapter-contract';");
fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write]', pageRel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const files=['frontend/lib/cmt-secure-master-provider-adapter-contract.ts','frontend/app/cmt/master/secure/agent/page.tsx'];for(const rel of files){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');if(!page.includes('createSecureMasterProviderAdapterContract')){console.error('[missing token] createSecureMasterProviderAdapterContract');ok=false}else console.log('[ok token] createSecureMasterProviderAdapterContract');const lib=fs.readFileSync(path.join(root,'frontend/lib/cmt-secure-master-provider-adapter-contract.ts'),'utf8');if(!lib.includes('export function createSecureMasterProviderAdapterContract')){console.error('[missing export]');ok=false}else console.log('[ok export]');if(ok)console.log('[OK] provider adapter contract import verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-provider-adapter-contract-import.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixadaptercontract:verify'] = 'node scripts/v-fix-provider-adapter-contract-import.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixadaptercontract:verify');
console.log('[OK] provider adapter contract import fix applied');
