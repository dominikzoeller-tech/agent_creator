"use client";

import { useState } from "react";

type WebResearchResult = { title: string; url: string; snippet: string; source?: string };
type WebResearchResponse = { ok: true; enabled: boolean; query: string; provider: string; results: WebResearchResult[]; message?: string } | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function WebResearchPage() {
  const [query, setQuery] = useState("Privacy-first local AI agent web research");
  const [count, setCount] = useState(5);
  const [response, setResponse] = useState<WebResearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function runResearch() {
    setLoading(true);
    try {
      const result = await fetch("/api/web-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, count }),
      });
      setResponse(await result.json());
    } finally {
      setLoading(false);
    }
  }

  const okResponse = response && response.ok ? response : null;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/memory">Memory</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
              <a className="nav-link" href="/web-research">Web Research</a>
        <a className="nav-link" href="/web-research-save">Research speichern</a>
        <a className="nav-link" href="/web-research-governance">Research Governance</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Web Research Tool</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Foundation für kontrollierte Web-Recherche. Standardmäßig deaktiviert, bis WEB_RESEARCH_ENABLED=true und BING_SEARCH_API_KEY gesetzt sind.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recherche testen</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: 12, alignItems: "end" }}>
          <label>
            <div className="subtle-text">Suchanfrage</div>
            <input style={inputStyle} value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>
            <div className="subtle-text">Anzahl</div>
            <input style={inputStyle} type="number" min={1} max={10} value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </label>
          <button style={buttonStyle} onClick={runResearch} disabled={loading}>{loading ? "Sucht..." : "Suchen"}</button>
        </div>
      </section>

      {response && !response.ok ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{response.error}</section> : null}

      {okResponse ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Ergebnis</h2>
          <div className="helper-text">Provider: {okResponse.provider} · Enabled: {String(okResponse.enabled)}</div>
          {okResponse.message ? <p>{okResponse.message}</p> : null}
          {okResponse.results.length === 0 ? <div className="helper-text">Keine Ergebnisse.</div> : (
            <div style={{ display: "grid", gap: 12 }}>
              {okResponse.results.map((item) => (
                <article key={item.url} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>{item.title}</a>
                  <div className="subtle-text">{item.source ?? item.url}</div>
                  <p>{item.snippet}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
