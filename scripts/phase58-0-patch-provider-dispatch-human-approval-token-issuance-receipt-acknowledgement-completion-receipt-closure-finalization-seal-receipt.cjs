
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
  pkg.scripts['phase58:0:verify'] = 'node scripts/phase58-0-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt.cjs';
  writeJson('package.json', pkg);
}

const store = `export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt = {
  id: string;
  phase: '58.0';
  name: string;
  status: 'seal_receipt_only';
  summary: string;
  priorSealBoundaryClosed: true;
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
  sealReceiptChecks: Array<{ id: string; label: string; passed: true; detail: string }>;
};

export function getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt(): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt {
  return {
    id: 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-v1',
    phase: '58.0',
    name: 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Receipt',
    status: 'seal_receipt_only',
    summary: 'Read-only seal receipt after closure finalization seal boundary policy audit. No dispatch capability is enabled.',
    priorSealBoundaryClosed: true,
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
    sealReceiptChecks: [
      { id: 'prior-seal-boundary-closed', label: 'Prior seal boundary closed', passed: true, detail: 'The seal boundary policy audit is treated as closed before this seal receipt is recorded.' },
      { id: 'seal-receipt-dry-run-only', label: 'Seal receipt dry-run only', passed: true, detail: 'This receipt records seal state only and does not mutate token or dispatch state.' },
      { id: 'dispatch-blocked', label: 'Dispatch blocked', passed: true, detail: 'Final dispatch remains blocked and execution gate remains closed.' },
      { id: 'no-provider-data', label: 'No provider data', passed: true, detail: 'No provider, model, prompt payload, secret, network call, or provider response exists.' },
    ],
  };
}
`;

const api = `import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt());
}
`;

const page = `import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt } from '../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store';

export default function ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPage() {
  const receipt = getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceipt();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase {receipt.phase}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{receipt.name}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{receipt.summary}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Seal Boundary</p><p className="mt-2 text-2xl font-bold text-emerald-950">Closed</p></div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-sky-800">Provider</p><p className="mt-2 text-2xl font-bold text-sky-950">{receipt.provider}</p></div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-800">Model</p><p className="mt-2 text-2xl font-bold text-indigo-950">{receipt.modelSelected}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Dispatch</p><p className="mt-2 text-2xl font-bold text-amber-950">Blocked</p></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Seal receipt checks</h2>
        <div className="mt-4 grid gap-3">
          {receipt.sealReceiptChecks.map((check) => (
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
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt/page.tsx',
  'package.json',
];
const fragments = [
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', "phase: '58.0'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'priorSealBoundaryClosed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'dryRunOnly: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', "provider: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', "modelSelected: 'none'"],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', 'providerDispatchAllowed: false'],
  ['package.json', 'phase58:0:verify'],
];
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; } else console.log('OK ' + file);
}
for (const [file, fragment] of fragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) { console.error('MISSING FRAGMENT ' + fragment + ' in ' + file); failed = true; } else console.log('OK fragment ' + fragment);
}
if (failed) process.exit(1);
console.log('Phase 58.0 verification OK.');
`;

writeFile('frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-store.ts', store);
writeFile('frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt/route.ts', api);
writeFile('frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt/page.tsx', page);
writeFile('scripts/phase58-0-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt.cjs', verify);
addScript();
console.log('Phase 58.0 patch applied. Next: npm run phase58:0:verify && npm run build');
