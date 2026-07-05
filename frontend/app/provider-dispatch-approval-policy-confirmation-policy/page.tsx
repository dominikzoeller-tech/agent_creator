"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Confirmation = { id: string; decision: string; timestamp: string; envelopeMode: string };
type Simulation = { id: string; timestamp: string; decision: string; reason: string; policyMode: string; policyChecks: Array<{ name: string; passed: boolean; reason: string }>; approvalPolicyConfirmedForHumanApprovalOnly: boolean; approvalCandidateApproved: boolean; approvalCandidateExecuted: boolean; networkCallPerformed: boolean; providerExecutionAllowed: boolean; llmCallPerformed: boolean; dryRunOnly: boolean };

export default function ProviderDispatchApprovalPolicyConfirmationPolicyPage() {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/provider-dispatch-approval-policy-confirmation-envelope?limit=100", { cache: "no-store" }),
        fetch("/api/provider-dispatch-approval-policy-confirmation-policy?limit=100", { cache: "no-store" })
      ]);
      const c = await cRes.json();
      const s = await sRes.json();
      if (cRes.ok) {
        const list = Array.isArray(c.providerDispatchApprovalPolicyConfirmationEnvelopes) ? c.providerDispatchApprovalPolicyConfirmationEnvelopes : [];
        setConfirmations(list);
        if (!selected && list[0]?.id) setSelected(list[0].id);
      }
      if (!sRes.ok) throw new Error(s?.error || "Policy Simulations konnten nicht geladen werden.");
      setSimulations(Array.isArray(s.simulations) ? s.simulations : []);
      setSummary(s.summary || null);
    } catch (err) { setError(err instanceof Error ? err.message : "Unbekannter Fehler"); }
  }
  useEffect(() => { load(); }, []);

  async function simulate() {
    const res = await fetch("/api/provider-dispatch-approval-policy-confirmation-policy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerDispatchApprovalPolicyConfirmationEnvelopeId: selected }) });
    if (!res.ok) { const p = await res.json(); setError(p?.error || "Policy Simulation fehlgeschlagen"); }
    await load();
  }

  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-approval-policy-confirmation-policy" /><div className="page-shell"><section className="hero-card"><h1 className="section-title">Provider Dispatch Approval Policy Confirmation Policy</h1><p style={{ lineHeight: 1.6 }}>Phase 42.1 simuliert Policy Checks für Approval Policy Confirmation Envelopes und schreibt Governance Audit Events. Kein Approval, keine Execution, kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev) => setSelected(ev.target.value)}>{confirmations.map((item) => <option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Approval Policy Confirmation Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{simulations.length === 0 ? <p>Noch keine Policy Simulations.</p> : simulations.map((simulation) => <article key={simulation.id} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0" }}><div><strong>{simulation.policyMode}</strong> <span className="chip">{simulation.decision}</span></div><div className="helper-text"><code>{simulation.id}</code> · {simulation.timestamp}</div><p><strong>Reason:</strong> {simulation.reason}</p><p><strong>Human only:</strong> {String(simulation.approvalPolicyConfirmedForHumanApprovalOnly)} · <strong>Approved:</strong> {String(simulation.approvalCandidateApproved)} · <strong>Executed:</strong> {String(simulation.approvalCandidateExecuted)} · <strong>Network:</strong> {String(simulation.networkCallPerformed)} · <strong>Provider execution:</strong> {String(simulation.providerExecutionAllowed)} · <strong>LLM:</strong> {String(simulation.llmCallPerformed)} · <strong>Dry-run:</strong> {String(simulation.dryRunOnly)}</p><ul>{simulation.policyChecks?.map((check) => <li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
