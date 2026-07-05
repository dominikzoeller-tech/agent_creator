"use client";

import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || url);
  return payload;
}

export default function ProviderDispatchTranscriptEnvelopeDashboardPage() {
  const [transcripts, setTranscripts] = useState<ApiState>({});
  const [policies, setPolicies] = useState<ApiState>({});
  const [results, setResults] = useState<ApiState>({});
  const [audit, setAudit] = useState<ApiState>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [t, p, r, a] = await Promise.all([
        fetchJson("/api/provider-dispatch-transcript-envelope?limit=200"),
        fetchJson("/api/provider-dispatch-transcript-envelope-policy?limit=200"),
        fetchJson("/api/provider-dispatch-dry-run-result-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);

      setTranscripts({ summary: t.summary, items: t.providerDispatchTranscriptEnvelopes || [] });
      setPolicies({ summary: p.summary, items: p.simulations || [] });
      setResults({ summary: r.summary, items: r.providerDispatchDryRunResultEnvelopes || [] });
      setAudit({ summary: a.summary, items: a.events || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }

  useEffect(() => { load(); }, []);

  const cards = [
    ["Provider Dispatch Transcript Envelopes", transcripts, "/provider-dispatch-transcript-envelope"],
    ["Transcript Envelope Policy", policies, "/provider-dispatch-transcript-envelope-policy"],
    ["Dry-Run Result Envelopes", results, "/provider-dispatch-dry-run-result-envelope"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;

  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-transcript-envelope-dashboard" />
      <div className="page-shell">
        <section className="hero-card" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor: "#c7d2fe" }}>
          <h1 className="section-title">Provider Dispatch Transcript Envelope Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 39.2 fasst Provider Dispatch Transcript Envelopes, Policy Simulationen,
            Dry-Run Result Envelopes und Governance Audit zusammen. Alles bleibt metadata-only:
            kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload,
            keine Secret-Werte, keine Provider Response und kein sensibler Request Body.
          </p>
          <button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button>
        </section>

        {error ? <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

        <section className="panel-card">
          <h2>Provider Dispatch Transcript Envelope Übersicht</h2>
          <div className="metrics-grid">
            {cards.map(([title, state, href]) => (
              <a key={title} className="metric-card" href={href}>
                <span className="metric-label">{title}</span>
                <strong className="metric-value">{state.items?.length ?? 0}</strong>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre>
              </a>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>controlled_provider_dispatch_transcript_envelope_metadata_only_no_provider_call</li>
            <li>providerDispatchTranscriptEnvelopePrepared=true</li>
            <li>transcriptEnvelopePrepared=true</li>
            <li>transcriptEnvelopePersisted=true</li>
            <li>transcriptEnvelopeContainsProviderResponse=false</li>
            <li>transcriptEnvelopeContainsPromptPayload=false</li>
            <li>transcriptEnvelopeContainsSecrets=false</li>
            <li>resultEnvelopeContainsProviderResponse=false</li>
            <li>commandEnvelopeExecuted=false</li>
            <li>executionGateOpen=false</li>
            <li>finalDispatchAllowed=false</li>
            <li>providerDispatchPerformed=false</li>
            <li>providerResponseIncluded=false</li>
            <li>providerResultIncluded=false</li>
            <li>networkCallAllowed=false</li>
            <li>networkCallPerformed=false</li>
            <li>providerExecutionAllowed=false</li>
            <li>realLlmCallAllowed=false</li>
            <li>llmCallPerformed=false</li>
            <li>executionAllowed=false</li>
            <li>toolExecutionAllowed=false</li>
            <li>agentExecutionAllowed=false</li>
            <li>dryRunOnly=true</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
