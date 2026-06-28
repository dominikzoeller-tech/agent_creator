"use client";

import { useState } from "react";

type Proposal = { type: string; title: string; summary: string; tags: string[]; source: string };
type SummaryResult = {
  ok: true;
  totalLogEntries: number;
  usedMemoryCount: number;
  usedKnowledgeCount: number;
  routes: Record<string, number>;
  topMemoryTitles: string[];
  topKnowledgeTitles: string[];
  proposal: Proposal;
  saved?: boolean;
  savedEntryId?: string;
};
type ApiResponse = SummaryResult | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const inputStyle: React.CSSProperties = { border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { ...buttonStyle, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1" };

export default function MemorySessionsPage() {
  const [limit, setLimit] = useState(25);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(save: boolean) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/memory-session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, save }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!data.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session Summary konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/memory">Memory Admin</a>
        <a className="nav-link" href="/memory-quality">Memory Quality</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Session Summary to Memory</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Erstellt aus aktuellen Logs einen strukturierten Memory-Vorschlag. Du kannst den Vorschlag prüfen oder direkt als Project Memory speichern.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Zusammenfassung erzeugen</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="subtle-text">Letzte Logeinträge</span>
            <input style={inputStyle} type="number" min={1} max={200} value={limit} onChange={(event) => setLimit(Number(event.target.value))} />
          </label>
          <button style={secondaryButtonStyle} disabled={loading} onClick={() => generate(false)}>{loading ? "Lädt..." : "Vorschlag erzeugen"}</button>
          <button style={buttonStyle} disabled={loading} onClick={() => generate(true)}>{loading ? "Speichert..." : "Als Memory speichern"}</button>
        </div>
      </section>

      {result ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Memory-Vorschlag</h2>
          {result.saved ? <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 12 }}>Gespeichert als: {result.savedEntryId}</div> : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div><strong>Logs:</strong> {result.totalLogEntries}</div>
            <div><strong>Memory genutzt:</strong> {result.usedMemoryCount}</div>
            <div><strong>Knowledge genutzt:</strong> {result.usedKnowledgeCount}</div>
          </div>
          <h3>{result.proposal.title}</h3>
          <p>{result.proposal.summary}</p>
          <div className="subtle-text">Typ: {result.proposal.type} · Tags: {result.proposal.tags.join(", ")} · Source: {result.proposal.source}</div>
          <h3>Top Memory-Titel</h3>
          <ul>{result.topMemoryTitles.map((title) => <li key={title}>{title}</li>)}</ul>
          <h3>Top Knowledge-Titel</h3>
          <ul>{result.topKnowledgeTitles.map((title) => <li key={title}>{title}</li>)}</ul>
        </section>
      ) : null}
    </main>
  );
}
