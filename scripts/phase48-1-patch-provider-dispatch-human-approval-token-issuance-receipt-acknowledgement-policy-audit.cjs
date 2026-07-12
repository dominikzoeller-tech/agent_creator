
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const frontend = path.join(root, 'frontend');

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\n'), 'utf8');
  console.log(`wrote ${relPath}`);
}

function readJson(relPath) {
  const abs = path.join(root, relPath);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function writeJson(relPath, value) {
  const abs = path.join(root, relPath);
  fs.writeFileSync(abs, JSON.stringify(value, null, 2) + '\n', 'utf8');
  console.log(`updated ${relPath}`);
}

function updatePackageScripts() {
  const pkgPath = 'package.json';
  const pkg = readJson(pkgPath);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase48:1:verify'] = 'node scripts/phase48-1-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit.cjs';
  writeJson(pkgPath, pkg);
}

const storeTs = `export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAuditStatus =
  | 'blocked'
  | 'policy_audit_only'
  | 'dry_run_only';

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
  policyChecks: Array<{
    id: string;
    label: string;
    passed: true;
    detail: string;
  }>;
  auditTrail: Array<{
    id: string;
    eventType: 'agent_registry_status_changed';
    message: string;
    dryRunOnly: true;
  }>;
};

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-v1',
    phase: '48.1',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Policy & Audit',
    status: 'policy_audit_only',
    summary:
      'Policy and audit layer for the acknowledgement receipt. This phase records simulated acknowledgement policy evidence only and keeps dispatch execution blocked.',
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
      {
        id: 'acknowledgement-policy-dry-run-only',
        label: 'Acknowledgement remains dry-run only',
        passed: true,
        detail: 'The acknowledgement policy audit does not issue, activate, consume, bind, approve, execute, or dispatch a token.',
      },
      {
        id: 'acknowledgement-policy-final-dispatch-blocked',
        label: 'Final dispatch remains blocked',
        passed: true,
        detail: 'Provider dispatch is still disabled; provider=none and modelSelected=none are preserved.',
      },
      {
        id: 'acknowledgement-policy-no-sensitive-payload',
        label: 'No sensitive execution payload exists',
        passed: true,
        detail: 'No prompt payload, provider response, network call, or secret is created by this phase.',
      },
      {
        id: 'acknowledgement-policy-compatible-audit-type',
        label: 'Compatible audit event type is used',
        passed: true,
        detail: 'The audit event is represented with agent_registry_status_changed to avoid custom GovernanceAuditEventType drift.',
      },
    ],
    auditTrail: [
      {
        id: 'phase48-1-acknowledgement-policy-audit-created',
        eventType: 'agent_registry_status_changed',
        message:
          'Simulated provider dispatch human approval token issuance receipt acknowledgement policy audit evidence created. Dispatch remains blocked.',
        dryRunOnly: true,
      },
    ],
  };
}
`;

const apiRouteTs = `import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit } from '@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit());
}
`;

const pageTsx = `import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit } from '@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store';

export default function ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAuditPage() {
  const audit = getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementPolicyAudit();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase {audit.phase}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{audit.name}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{audit.summary}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Dispatch</h2>
          <p className="mt-2 text-2xl font-bold text-emerald-950">Blocked</p>
          <p className="mt-1 text-sm text-emerald-900">Final dispatch and execution gate remain closed.</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">Provider</h2>
          <p className="mt-2 text-2xl font-bold text-sky-950">{audit.provider}</p>
          <p className="mt-1 text-sm text-sky-900">No model selected; no provider response exists.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Mode</h2>
          <p className="mt-2 text-2xl font-bold text-amber-950">Dry-run only</p>
          <p className="mt-1 text-sm text-amber-900">Policy audit evidence only; no token lifecycle mutation.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Policy checks</h2>
        <div className="mt-4 grid gap-3">
          {audit.policyChecks.map((check) => (
            <article key={check.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-950">{check.label}</h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">PASS</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{check.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Audit trail</h2>
        <ul className="mt-4 space-y-3">
          {audit.auditTrail.map((event) => (
            <li key={event.id} className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
              <p className="font-semibold text-slate-950">{event.eventType}</p>
              <p className="mt-1">{event.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
`;

const verifyCjs = `const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredFiles = [
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx',
];

const requiredFragments = [
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "provider: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenIssued: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenActivated: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'humanApprovalTokenConsumed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'approvalCandidateApproved: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'approvalCandidateExecuted: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'promptPayloadPresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'secretsPresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'providerResponsePresent: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', "auditEventType: 'agent_registry_status_changed'"],
  ['package.json', 'phase48:1:verify'],
];

let failed = false;
for (const file of requiredFiles) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    console.error(`MISSING ${file}`);
    failed = true;
  } else {
    console.log(`OK ${file}`);
  }
}

for (const [file, fragment] of requiredFragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) {
    console.error(`MISSING FRAGMENT ${fragment} in ${file}`);
    failed = true;
  } else {
    console.log(`OK fragment ${fragment}`);
  }
}

if (failed) {
  console.error('Phase 48.1 verification failed.');
  process.exit(1);
}

console.log('Phase 48.1 verification OK.');
`;

writeFile('frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts', storeTs);
writeFile('frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts', apiRouteTs);
writeFile('frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx', pageTsx);
writeFile('scripts/phase48-1-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit.cjs', verifyCjs);
updatePackageScripts();

console.log('Phase 48.1 patch applied. Next: npm run phase48:1:verify && npm run build');
