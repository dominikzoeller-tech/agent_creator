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

export default function ProviderDispatchReadinessDashboardPage() {
  const [readiness, setReadiness] = useState<ApiState>({});
  const [policy, setPolicy] = useState<ApiState>({});
  const [envelopes, setEnvelopes] = useState<ApiState>({});
  const [audit, setAudit] = useState<ApiState>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [r, p, e, a] = await Promise.all([
        fetchJson("/api/provider-dispatch-readiness?limit=200"),
        fetchJson("/api/provider-dispatch-readiness-policy?limit=200"),
        fetchJson("/api/provider-request-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setReadiness({ summary: r.summary, items: r.providerDispatchReadiness || [] });
      setPolicy({ summary: p.summary, items: p.simulations || [] });
      setEnvelopes({ summary: e.summary, items: e.providerRequestEnvelopes || [] });
      setAudit({ summary: a.summary, items: a.events || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }

  useEffect(() => { load(); }, []);

  const cards = [
    ["Provider Dispatch Readiness", readiness, "/provider-dispatch-readiness"],
    ["Provider Dispatch Readiness Policy", policy, "/provider-dispatch-readiness-policy"],
    ["Provider Request Envelopes", envelopes, "/provider-request-envelope"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;

  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-readiness-dashboard" />
      <div className="page-shell">
        <section
          className="hero-card"
          style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor: "#c7d2fe" }}
        >
          <h1 className="section-title">Provider Dispatch Readiness Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 33.2 fasst Provider Dispatch Readiness, Policy Simulationen,
            Provider Request Envelopes und Governance Audit zusammen. Readiness bleibt
            metadata-only. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf,
            kein Prompt Payload, keine Secret-Werte und kein sensibler Request Body.
          </p>
          <button className="secondary-button" type="button" onClick={load}>
            Dashboard aktualisieren
          </button>
        </section>

        {error ? (
          <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            {error}
          </section>
        ) : null}

        <section className="panel-card">
          <h2>Provider Dispatch Readiness Übersicht</h2>
          <div className="metrics-grid">
            {cards.map(([title, state, href]) => (
              <a className="metric-card" href={href} key={title} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="metric-label">{title}</span>
                <strong className="metric-value">{state.items?.length ?? 0}</strong>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                  {JSON.stringify(state.summary ?? {}, null, 2)}
                </pre>
              </a>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>controlled_provider_dispatch_readiness_metadata_only_no_provider_call</li>
            <li>providerDispatchPrepared=true</li>
            <li>providerDispatchPerformed=false</li>
            <li>metadataOnly=true</li>
            <li>provider=none</li>
            <li>modelSelected=none</li>
            <li>dispatchPayloadIncluded=false</li>
            <li>envelopePayloadIncluded=false</li>
            <li>promptPayloadIncluded=false</li>
            <li>promptIncluded=false</li>
            <li>promptRedactedPreviewIncluded=false</li>
            <li>secretValuesIncluded=false</li>
            <li>requestBodyIncluded=false</li>
            <li>sensitiveRequestBodyIncluded=false</li>
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
