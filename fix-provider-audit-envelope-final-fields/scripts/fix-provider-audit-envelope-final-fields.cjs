const fs = require('fs');
const path = require('path');
const root = process.cwd();
const rel = 'frontend/lib/cmt-secure-master-provider-audit-envelope.ts';
const full = path.join(root, rel);

if (!fs.existsSync(full)) {
  console.error('[missing]', rel);
  process.exit(1);
}

const content = `export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY = 'secure_master_provider_audit_history';

export type SecureMasterProviderAuditEnvelope = {
  id: string;
  requestId: string;
  createdAt: string;
  auditPrepared: true;
  dispatchStatus: 'blocked_dry_run' | 'prepared' | 'blocked';
  dryRunOnly: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsIncluded: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  llmCallPerformed: false;
  inputPreview: string;
  approvalDecision: string;
  privacyDecision: string;
  adapterPrepared: boolean;
  serverDryRunAvailable: boolean;
  providerName: string;
  modelName: string;
  requiredAuditFieldsLater: string[];
  forbiddenAuditFields: string[];
  redactionRules: string[];
  resultSummary: string;
  blockedReason: string;
  nextSafeStep: string;
};

export type SecureMasterProviderAuditHistoryItem = SecureMasterProviderAuditEnvelope;

export function createSecureMasterProviderAuditEnvelope(params: {
  input?: string;
  approvalDecision?: string;
  privacyDecision?: string;
  adapterPrepared?: boolean;
  serverDryRunAvailable?: boolean;
  resultSummary?: string;
  providerName?: string;
  modelName?: string;
  nextSafeStep?: string;
} = {}): SecureMasterProviderAuditEnvelope {
  const id = 'provider_audit_' + Date.now();
  return {
    id,
    requestId: id,
    createdAt: new Date().toISOString(),
    auditPrepared: true,
    dispatchStatus: 'blocked_dry_run',
    dryRunOnly: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsIncluded: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    llmCallPerformed: false,
    inputPreview: String(params.input ?? '').slice(0, 240),
    approvalDecision: params.approvalDecision ?? 'local_only',
    privacyDecision: params.privacyDecision ?? 'allow_local_only',
    adapterPrepared: Boolean(params.adapterPrepared),
    serverDryRunAvailable: Boolean(params.serverDryRunAvailable),
    providerName: params.providerName ?? 'none',
    modelName: params.modelName ?? 'none',
    requiredAuditFieldsLater: [
      'requestId',
      'createdAt',
      'providerName',
      'modelName',
      'privacyDecision',
      'approvalDecision',
      'providerCallAllowed',
      'secretsIncluded',
      'networkCallPerformed',
      'resultSummary',
    ],
    forbiddenAuditFields: [
      'apiKey',
      'secret',
      'token',
      'password',
      'rawProviderCredential',
      'fullUnredactedSensitiveInput',
    ],
    redactionRules: [
      'Keine API-Keys speichern',
      'Keine Tokens speichern',
      'Keine personenbezogenen Daten im Audit-Log speichern',
      'Input nur als gekuerzte Preview erfassen',
      'Secrets niemals in Browser/localStorage schreiben',
    ],
    resultSummary: params.resultSummary ?? 'Provider-Audit lokal erstellt. Kein externer Call.',
    blockedReason: 'Audit-Envelope ist lokal. Provider-Call bleibt blockiert.',
    nextSafeStep: params.nextSafeStep ?? 'Worker/Build gruen bekommen, dann Agent-Arbeitsmodus weiter nutzen.',
  };
}

export function createProviderAuditEnvelope(params: Parameters<typeof createSecureMasterProviderAuditEnvelope>[0] = {}) {
  return createSecureMasterProviderAuditEnvelope(params);
}

export function createProviderAuditHistoryItem(envelope: SecureMasterProviderAuditEnvelope): SecureMasterProviderAuditHistoryItem {
  return {
    ...envelope,
    id: envelope.id || 'provider_audit_' + Date.now(),
    requestId: envelope.requestId || envelope.id || 'provider_audit_' + Date.now(),
    createdAt: envelope.createdAt || new Date().toISOString(),
    auditPrepared: true,
    dispatchStatus: envelope.dispatchStatus || 'blocked_dry_run',
    secretsIncluded: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    llmCallPerformed: false,
    requiredAuditFieldsLater: envelope.requiredAuditFieldsLater || [],
    forbiddenAuditFields: envelope.forbiddenAuditFields || [],
    redactionRules: envelope.redactionRules || [],
    nextSafeStep: envelope.nextSafeStep || 'Weiter mit Build-Verifikation.',
  };
}

export default createSecureMasterProviderAuditEnvelope;
`;

fs.writeFileSync(full, content, 'utf8');
console.log('[write]', rel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/lib/cmt-secure-master-provider-audit-envelope.ts';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');for(const token of ['redactionRules','nextSafeStep','secretsIncluded','requiredAuditFieldsLater','forbiddenAuditFields','createProviderAuditHistoryItem']){if(!text.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] provider audit envelope final fields verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-provider-audit-envelope-final-fields.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixauditfinal:verify'] = 'node scripts/v-fix-provider-audit-envelope-final-fields.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixauditfinal:verify');
console.log('[OK] provider audit envelope final fields fix applied');
