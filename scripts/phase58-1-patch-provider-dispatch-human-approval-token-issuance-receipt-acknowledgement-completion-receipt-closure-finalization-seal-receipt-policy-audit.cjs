
const fs = require('fs');
const path = require('path');
const root = process.cwd();

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\n'), 'utf8');
  console.log(`wrote ${relPath}`);
}
function readJson(relPath) { return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8')); }
function writeJson(relPath, value) { fs.writeFileSync(path.join(root, relPath), JSON.stringify(value, null, 2) + '\n', 'utf8'); console.log(`updated ${relPath}`); }
function addScript() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase58:1:verify'] = 'node scripts/phase58-1-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit.cjs';
  writeJson('package.json', pkg);
}

const store = `export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit = {
  id: string;
  phase: '58.1';
  name: string;
  status: 'seal_receipt_policy_audit_only';
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

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-v1',
    phase: '58.1',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Receipt Policy & Audit',
    status: 'seal_receipt_policy_audit_only',
    summary: 'Read-only policy and audit layer for the closure finalization seal receipt. Dispatch remains blocked.',
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
      { id: 'seal-receipt-policy-dry-run-only', label: 'Dry-run only', passed: true, detail: 'No provider call, network call, token mutation, approval, execution, or dispatch is enabled.' },
      { id: 'seal-receipt-policy-dispatch-blocked', label: 'Dispatch blocked', passed: true, detail: 'Final dispatch remains blocked and execution gate remains closed.' },
      { id: 'seal-receipt-policy-provider-none', label: 'Provider none', passed: true, detail: 'Provider and model selection remain none.' },
      { id: 'seal-receipt-policy-no-sensitive-output', label: 'No sensitive output', passed: true, detail: 'No prompt payload, secret, provider response, or network response exists.' },
    ],
    auditTrail: [
      { id: 'phase58-1-seal-receipt-policy-audit-created', eventType: 'agent_registry_status_changed', message: 'Seal receipt policy audit evidence created. Dispatch remains blocked.', dryRunOnly: true },
    ],
  };
}
`;

const api = `import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit());
}
`;

const page = `import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit } from '../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store';

export default function ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAuditPage() {
  const audit = getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase {audit.phase}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{audit.name}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{audit.summary}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Dispatch</p><p className="mt-2 text-2xl font-bold text-emerald-950">Blocked</p></div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-sky-800">Provider</p><p className="mt-2 text-2xl font-bold text-sky-950">{audit.provider}</p></div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-800">Model</p><p className="mt-2 text-2xl font-bold text-indigo-950">{audit.modelSelected}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Mode</p><p className="mt-2 text-2xl font-bold text-amber-950">Dry-run</p></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Policy checks</h2>
        <div className="mt-4 grid gap-3">
          {audit.policyChecks.map((check) => (
            <article key={check.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4"><h3 className="font-semibold text-slate-950">{check.label}</h3><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">PASS</span></div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{check.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

const verify = `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit/page.tsx',
  'package.json',
];
const fragments = [
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', "phase: '58.1'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', "provider: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', "auditEventType: 'agent_registry_status_changed'"],
  ['package.json', 'phase58:1:verify'],
];
let failed = false;
for (const file of files) { const abs = path.join(root, file); if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; } else console.log('OK ' + file); }
for (const [file, fragment] of fragments) { const abs = path.join(root, file); const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : ''; if (!content.includes(fragment)) { console.error('MISSING FRAGMENT ' + fragment + ' in ' + file); failed = true; } else console.log('OK fragment ' + fragment); }
if (failed) process.exit(1);
console.log('Phase 58.1 verification OK.');
`;

writeFile('frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store.ts', store);
writeFile('frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit/route.ts', api);
writeFile('frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit/page.tsx', page);
writeFile('scripts/phase58-1-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit.cjs', verify);
addScript();
console.log('Phase 58.1 patch applied. Next: npm run phase58:1:verify && npm run build');
