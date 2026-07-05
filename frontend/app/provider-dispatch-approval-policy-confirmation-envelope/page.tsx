"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Simulation = { id: string; decision: string; timestamp: string; policyMode: string };
type Confirmation = { id: string; timestamp: string; decision: string; reason: string; envelopeMode: string; providerDispatchApprovalPolicyConfirmationEnvelopePrepared: boolean; approvalPolicyConfirmedForHumanApprovalOnly: boolean; approvalCandidateApproved: boolean; approvalCandidateExecuted: boolean; networkCallPerformed: boolean; providerExecutionAllowed: boolean; llmCallPerformed: boolean; dryRunOnly: boolean };

export default function ProviderDispatchApprovalPolicyConfirmationEnvelopePage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/provider-dispatch-approval-candidate-envelope-policy?limit=100", { cache: "no-store" }),
        fetch("/api/provider-dispatch-approval-policy-confirmation-envelope?limit=100", { cache: "no-store" })
      ]);
      const s = await sRes.json();
      const c = await cRes.json();
      if (sRes.ok) {
        const list = Array.isArray(s.simulations) ? s.simulations : [];
        setSimulations(list);
        if (!selected && list[0]?.id) setSelected(list[0].id);
      }
      if (!cRes.ok) throw new Error(c?.error || "Policy Confirmation Envelopes konnten nicht geladen werden.");
      setConfirmations(Array.isArray(c.providerDispatchApprovalPolicyConfirmationEnvelopes) ? c.providerDispatchApprovalPolicyConfirmationEnvelopes : []);
      setSummary(c.summary || null);
    } catch (err) { setError(err instanceof Error ? err.message : "Unbekannter Fehler"); }
  }

  useEffect(() => { load(); }, []);

  async function createEnvelope() {
    const res = await fetch("/api/provider-dispatch-approval-policy-confirmation-envelope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerDispatchApprovalCandidateEnvelopePolicySimulationId: selected }) });
    if (!res.ok) { const p = await res.json(); setError(p?.error || "Policy Confirmation Envelope fehlgeschlagen"); }
    await load();
  }

  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-approval-policy-confirmation-envelope" /><div className="page-shell"><section className="hero-card"><h1 className="section-title">Provider Dispatch Approval Policy Confirmation Envelope</h1><p style={{ lineHeight: 1.6 }}>Phase 42.0 bestätigt eine Approval Candidate Policy Simulation als Human-Approval-only Confirmation Envelope. Keine Approval-Ausführung, kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Policy Confirmation Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev) => setSelected(ev.target.value)}>{simulations.map((item) => <option key={item.id} value={item.id}>{item.policyMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Approval Policy Confirmation Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Confirmation Envelopes</h2>{confirmations.length === 0 ? <p>Noch keine Policy Confirmation Envelopes.</p> : confirmations.map((item) => <article key={item.id} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0" }}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchApprovalPolicyConfirmationEnvelopePrepared)} · <strong>Human only:</strong> {String(item.approvalPolicyConfirmedForHumanApprovalOnly)} · <strong>Approved:</strong> {String(item.approvalCandidateApproved)} · <strong>Executed:</strong> {String(item.approvalCandidateExecuted)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
