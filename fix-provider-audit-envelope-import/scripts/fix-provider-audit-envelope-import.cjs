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

const libRel = 'frontend/lib/cmt-secure-master-provider-audit-envelope.ts';
const libContent = `export type SecureMasterProviderAuditEnvelope = {
  id: string;
  createdAt: string;
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  adapterPrepared: boolean;
  serverDryRunAvailable: boolean;
  resultSummary: string;
  blockedReason: string;
};

export type SecureMasterProviderAuditHistoryItem = SecureMasterProviderAuditEnvelope;

export function createSecureMasterProviderAuditEnvelope(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
  adapterPrepared?: boolean;
  serverDryRunAvailable?: boolean;
  resultSummary?: string;
} = {}): SecureMasterProviderAuditEnvelope {
  return {
    id: 'provider_audit_' + Date.now(),
    createdAt: new Date().toISOString(),
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    inputPreview: String(params.input ?? '').slice(0, 240),
    approvalDecision: params.approvalDecision ?? 'local_only',
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    adapterPrepared: Boolean(params.adapterPrepared),
    serverDryRunAvailable: Boolean(params.serverDryRunAvailable),
    resultSummary: params.resultSummary ?? 'Provider-Audit lokal erstellt. Kein externer Call.',
    blockedReason: 'Audit-Envelope ist lokal. Provider-Call bleibt blockiert.',
  };
}

export function createProviderAuditEnvelope(params: Parameters<typeof createSecureMasterProviderAuditEnvelope>[0] = {}) {
  return createSecureMasterProviderAuditEnvelope(params);
}

export default createSecureMasterProviderAuditEnvelope;
`;
write(libRel, libContent);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');
page = ensureImport(page, "import { createSecureMasterProviderAuditEnvelope, type SecureMasterProviderAuditHistoryItem } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';");
fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write]', pageRel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-provider-audit-envelope.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['createSecureMasterProviderAuditEnvelope','SecureMasterProviderAuditHistoryItem','cmt-secure-master-provider-audit-envelope']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}}const lib=fs.readFileSync(path.join(root,'frontend/lib/cmt-secure-master-provider-audit-envelope.ts'),'utf8');for(const token of ['export function createSecureMasterProviderAuditEnvelope','export type SecureMasterProviderAuditHistoryItem','createProviderAuditEnvelope']){if(!lib.includes(token)){console.error('[missing export]',token);ok=false}else console.log('[ok export]',token)}}if(ok)console.log('[OK] provider audit envelope import verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-provider-audit-envelope-import.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixaudit:verify'] = 'node scripts/v-fix-provider-audit-envelope-import.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixaudit:verify');
console.log('[OK] provider audit envelope import fix applied');
