import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveReceipt } from '../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-receipt-store';

export default function ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveReceiptPage() {
  const receipt = getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveReceipt();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase {receipt.phase}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{receipt.name}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{receipt.summary}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Archive Boundary</p><p className="mt-2 text-2xl font-bold text-emerald-950">Closed</p></div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-sky-800">Provider</p><p className="mt-2 text-2xl font-bold text-sky-950">{receipt.provider}</p></div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-800">Model</p><p className="mt-2 text-2xl font-bold text-indigo-950">{receipt.modelSelected}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Dispatch</p><p className="mt-2 text-2xl font-bold text-amber-950">Blocked</p></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Archive receipt checks</h2>
        <div className="mt-4 grid gap-3">
          {receipt.archiveReceiptChecks.map((check) => (
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
