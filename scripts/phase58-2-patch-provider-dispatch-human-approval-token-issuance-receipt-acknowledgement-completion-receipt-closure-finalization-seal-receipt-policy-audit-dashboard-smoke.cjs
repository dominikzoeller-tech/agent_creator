
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
function addScripts() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase58:2:verify'] = 'node scripts/phase58-2-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard-smoke.cjs';
  pkg.scripts['phase58:2:smoke'] = 'node scripts/phase58-2-smoke-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard.cjs';
  writeJson('package.json', pkg);
}

const dashboard = `import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit } from '../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-store';

export default function ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAuditDashboardPage() {
  const audit = getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationSealReceiptPolicyAudit();
  const invariants = [
    ['Dry-run only', audit.dryRunOnly],
    ['Provider none', audit.provider === 'none'],
    ['Model none', audit.modelSelected === 'none'],
    ['Final dispatch blocked', audit.finalDispatchBlocked],
    ['Execution gate closed', audit.executionGateClosed],
    ['Token not issued', audit.humanApprovalTokenIssued === false],
    ['Token not activated', audit.humanApprovalTokenActivated === false],
    ['Token not consumed', audit.humanApprovalTokenConsumed === false],
    ['Candidate not approved', audit.approvalCandidateApproved === false],
    ['Candidate not executed', audit.approvalCandidateExecuted === false],
    ['No prompt payload', audit.promptPayloadPresent === false],
    ['No secrets', audit.secretsPresent === false],
    ['No provider response', audit.providerResponsePresent === false],
    ['No network call', audit.networkCallAllowed === false],
    ['No provider dispatch', audit.providerDispatchAllowed === false],
  ];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase 58.2 Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Receipt Policy Audit Dashboard</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">Read-only dashboard for closure finalization seal receipt policy audit evidence. Dispatch remains blocked.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Status</p><p className="mt-2 text-2xl font-bold text-emerald-950">Blocked</p></div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-sky-800">Provider</p><p className="mt-2 text-2xl font-bold text-sky-950">{audit.provider}</p></div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-800">Model</p><p className="mt-2 text-2xl font-bold text-indigo-950">{audit.modelSelected}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Mode</p><p className="mt-2 text-2xl font-bold text-amber-950">Dry-run</p></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Invariant checks</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {invariants.map(([label, passed]) => (
            <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <span className="font-medium text-slate-800">{label}</span>
              <span className={passed ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800' : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800'}>{passed ? 'PASS' : 'FAIL'}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Policy checks</h2>
        <div className="mt-4 grid gap-3">
          {audit.policyChecks.map((check) => (
            <article key={check.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4"><h3 className="font-semibold text-slate-950">{check.label}</h3><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">PASS</span></div>
              <p className="mt-2 text-sm text-slate-700">{check.detail}</p>
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
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx',
  'scripts/phase58-2-smoke-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard.cjs',
  'package.json',
];
const fragments = [
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', 'Phase 58.2 Dashboard'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', "audit.provider === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', "audit.modelSelected === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', 'audit.networkCallAllowed === false'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', 'audit.providerDispatchAllowed === false'],
  ['package.json', 'phase58:2:verify'],
  ['package.json', 'phase58:2:smoke'],
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
console.log('Phase 58.2 verification OK.');
`;

const smoke = `const http = require('http');
const checks = [
  ['UI Seal Receipt Policy Audit Dashboard', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard'],
  ['UI Seal Receipt Policy Audit', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit'],
  ['UI Seal Receipt', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt'],
  ['API Seal Receipt Policy Audit', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit'],
  ['API Seal Receipt', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) { return new Promise((resolve, reject) => { const req = http.get(url, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }); req.on('error', reject); req.setTimeout(8000, () => req.destroy(new Error('timeout'))); }); }
(async () => {
  let failed = false;
  for (const [name, url] of checks) {
    try { const status = await get(url); if (status >= 200 && status < 400) console.log('OK   ' + name + ': ' + status + ' ' + url); else { console.error('FAIL ' + name + ': ' + status + ' ' + url); failed = true; } }
    catch (err) { console.error('FAIL ' + name + ': ' + err.message + ' ' + url); failed = true; }
  }
  if (failed) process.exit(1);
  console.log('Smoke OK. Phase 58.2 URLs reachable.');
})();
`;

writeFile('frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard/page.tsx', dashboard);
writeFile('scripts/phase58-2-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard-smoke.cjs', verify);
writeFile('scripts/phase58-2-smoke-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-receipt-policy-audit-dashboard.cjs', smoke);
addScripts();
console.log('Phase 58.2 patch applied. Next: npm run phase58:2:verify && npm run build');
