"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ReleaseCandidate = { id: string; decision: string; timestamp: string; envelopeMode: string };
type ApprovalCandidate = { id: string; timestamp: string; decision: string; reason: string; envelopeMode: string; providerDispatchApprovalCandidateEnvelopePrepared: boolean; approvalCandidateReadyForHumanApproval: boolean; approvalCandidateApproved: boolean; approvalCandidateExecuted: boolean; approvalCandidateContainsProviderResponse: boolean; approvalCandidateContainsPromptPayload: boolean; approvalCandidateContainsSecrets: boolean; networkCallPerformed: boolean; providerExecutionAllowed: boolean; llmCallPerformed: boolean; dryRunOnly: boolean };

export default function ProviderDispatchApprovalCandidateEnvelopePage() {
  const [releaseCandidates, setReleaseCandidates] = useState<ReleaseCandidate[]>([]);
  const [approvalCandidates, setApprovalCandidates] = useState<ApprovalCandidate[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [rRes, aRes] = await Promise.all([
        fetch("/api/provider-dispatch-release-candidate-envelope?limit=100", { cache: "no-store" }),
        fetch("/api/provider-dispatch-approval-candidate-envelope?limit=100", { cache: "no-store" })
      ]);
      const r = await rRes.json();
      const a = await aRes.json();
      if (rRes.ok) {
        const list = Array.isArray(r.providerDispatchReleaseCandidateEnvelopes) ? r.providerDispatchReleaseCandidateEnvelopes : [];
        setReleaseCandidates(list);
        if (!selected && list[0]?.id) setSelected(list[0].id);
      }
      if (!aRes.ok) throw new Error(a?.error || "Approval Candidate Envelopes konnten nicht geladen werden.");
      setApprovalCandidates(Array.isArray(a.providerDispatchApprovalCandidateEnvelopes) ? a.providerDispatchApprovalCandidateEnvelopes : []);
      setSummary(a.summary || null);
    } catch (err) { setError(err instanceof Error ? err.message : "Unbekannter Fehler"); }
  }

  useEffect(() => { load(); }, []);

  async function createEnvelope() {
    const res = await fetch("/api/provider-dispatch-approval-candidate-envelope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerDispatchReleaseCandidateEnvelopeId: selected }) });
    if (!res.ok) { const p = await res.json(); setError(p?.error || "Approval Candidate Envelope fehlgeschlagen"); }
    await load();
  }

  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-approval-candidate-envelope" /><div className="page-shell"><section className="hero-card"><h1 className="section-title">Provider Dispatch Approval Candidate Envelope</h1><p style={{ lineHeight: 1.6 }}>Phase 41.0 bereitet ein Provider Dispatch Approval Candidate Envelope vor. Es ist nur bereit für Human Approval, nicht approved und nicht ausgeführt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Approval Candidate Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev) => setSelected(ev.target.value)}>{releaseCandidates.map((item) => <option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Approval Candidate Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Approval Candidate Envelopes</h2>{approvalCandidates.length === 0 ? <p>Noch keine Approval Candidate Envelopes.</p> : approvalCandidates.map((item) => <article key={item.id} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0" }}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchApprovalCandidateEnvelopePrepared)} · <strong>Human approval:</strong> {String(item.approvalCandidateReadyForHumanApproval)} · <strong>Approved:</strong> {String(item.approvalCandidateApproved)} · <strong>Executed:</strong> {String(item.approvalCandidateExecuted)}</p><p><strong>Provider response:</strong> {String(item.approvalCandidateContainsProviderResponse)} · <strong>Prompt payload:</strong> {String(item.approvalCandidateContainsPromptPayload)} · <strong>Secrets:</strong> {String(item.approvalCandidateContainsSecrets)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
