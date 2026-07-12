
const fs = require('fs');
const path = require('path');
const root = process.cwd();

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\n'), 'utf8');
  console.log(`wrote ${relPath}`);
}
function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}
function writeJson(relPath, value) {
  fs.writeFileSync(path.join(root, relPath), JSON.stringify(value, null, 2) + '\n', 'utf8');
  console.log(`updated ${relPath}`);
}
function addScript() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase49:0a:verify'] = 'node scripts/phase49-0a-verify-relative-imports-for-acknowledgement-boundary-stores.cjs';
  writeJson('package.json', pkg);
}

const policyStore = `export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAuditStatus = 'blocked' | 'policy_audit_only' | 'dry_run_only';

export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit = {
  id: string;
  phase: '48.1';
  name: string;
  status: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAuditStatus;
  summary: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  auditEventType: 'agent_registry_status_changed';
  policyChecks: Array<{ id: string; label: string; passed: true; detail: string }>;
  auditTrail: Array<{ id: string; eventType: 'agent_registry_status_changed'; message: string; dryRunOnly: true }>;
};

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-v1',
    phase: '48.1',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Policy & Audit',
    status: 'policy_audit_only',
    summary: 'Read-only policy audit evidence for receipt acknowledgement. Dispatch remains blocked.',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    promptPayloadPresent: false,
    secretsPresent: false,
    providerResponsePresent: false,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    auditEventType: 'agent_registry_status_changed',
    policyChecks: [
      { id: 'dry-run-only', label: 'Dry-run only', passed: true, detail: 'No provider dispatch or token mutation is enabled.' },
      { id: 'dispatch-blocked', label: 'Final dispatch blocked', passed: true, detail: 'Execution gate stays closed and provider remains none.' },
      { id: 'no-sensitive-payload', label: 'No sensitive payload', passed: true, detail: 'No prompt payload, secret, provider response, or network call exists.' },
      { id: 'compatible-audit-type', label: 'Compatible audit type', passed: true, detail: 'Uses agent_registry_status_changed.' },
    ],
    auditTrail: [
      { id: 'phase49-0a-relative-import-hotfix', eventType: 'agent_registry_status_changed', message: 'Relative import hotfix applied; dispatch remains blocked.', dryRunOnly: true },
    ],
  };
}
`;

const boundaryStore = `export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionBoundary = {
  id: string;
  phase: '49.0';
  name: string;
  status: 'completion_boundary_only';
  summary: string;
  previousPhaseClosed: true;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  completionChecks: Array<{ id: string; label: string; passed: true; detail: string }>;
};

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionBoundary(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionBoundary {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-v1',
    phase: '49.0',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Boundary',
    status: 'completion_boundary_only',
    summary: 'Read-only completion boundary for the acknowledgement policy audit block. No dispatch capability is enabled.',
    previousPhaseClosed: true,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    promptPayloadPresent: false,
    secretsPresent: false,
    providerResponsePresent: false,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    completionChecks: [
      { id: 'phase48-closed', label: 'Phase 48 block closed', passed: true, detail: 'Acknowledgement policy audit handoff is treated as closed.' },
      { id: 'dispatch-still-blocked', label: 'Dispatch still blocked', passed: true, detail: 'Final dispatch and execution gate remain closed.' },
      { id: 'provider-none', label: 'Provider remains none', passed: true, detail: 'No provider or model is selected.' },
      { id: 'no-sensitive-data', label: 'No sensitive data', passed: true, detail: 'No prompt payload, secrets, provider response, or network call exists.' },
    ],
  };
}
`;

const apiPolicy = `import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit());
}
`;

const apiBoundary = `import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionBoundary } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionBoundary());
}
`;

function replaceImport(relPath, fromText, toText) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return;
  const content = fs.readFileSync(abs, 'utf8');
  fs.writeFileSync(abs, content.split(fromText).join(toText), 'utf8');
  console.log(`updated imports ${relPath}`);
}

writeFile('frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', policyStore);
writeFile('frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store.ts', boundaryStore);
writeFile('frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts', apiPolicy);
writeFile('frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/route.ts', apiBoundary);
replaceImport(
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx',
  "@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store",
  "../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store"
);
replaceImport(
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-dashboard/page.tsx',
  "@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store",
  "../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store"
);
replaceImport(
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/page.tsx',
  "@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store",
  "../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store"
);

const verify = `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts',
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-dashboard/page.tsx',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/page.tsx',
  'package.json',
];
const forbidden = '@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement';
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; } else console.log('OK ' + file);
}
for (const file of files.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (content.includes(forbidden)) { console.error('FORBIDDEN ALIAS IMPORT in ' + file); failed = true; }
}
const policyStore = fs.readFileSync(path.join(root, 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts'), 'utf8');
const boundaryStore = fs.readFileSync(path.join(root, 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store.ts'), 'utf8');
for (const fragment of ['dryRunOnly: true', "provider: 'none'", "modelSelected: 'none'", 'finalDispatchBlocked: true', 'executionGateClosed: true', 'networkCallAllowed: false', 'providerDispatchAllowed: false']) {
  if (!policyStore.includes(fragment) || !boundaryStore.includes(fragment)) { console.error('MISSING invariant ' + fragment); failed = true; } else console.log('OK invariant ' + fragment);
}
if (!fs.readFileSync(path.join(root, 'package.json'), 'utf8').includes('phase49:0a:verify')) { console.error('MISSING phase49:0a:verify'); failed = true; }
if (failed) process.exit(1);
console.log('Phase 49.0a hotfix verification OK.');
`;
writeFile('scripts/phase49-0a-verify-relative-imports-for-acknowledgement-boundary-stores.cjs', verify);
addScript();
console.log('Phase 49.0a hotfix applied. Next: npm run phase49:0a:verify && npm run build');
