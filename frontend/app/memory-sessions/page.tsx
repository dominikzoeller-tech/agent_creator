"use client";

import { useState } from "react";

type Proposal = { type: "milestone" | "decision" | "note"; title: string; summary: string; tags: string[]; source: string };
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
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { ...buttonStyle, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1" };

function cloneProposal(proposal: Proposal): Proposal {
  return { ...proposal, tags: [...proposal.tags] };
}

export default function MemorySessionsPage() {
  const [limit, setLimit] = useState(25);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [draft, setDraft] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/memory-session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, save: false }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!data.ok) throw new Error(data.error);
      setResult(data);
      setDraft(cloneProposal(data.proposal));
      setMessage("Memory-Vorschlag erzeugt. Bitte prüfen und bei Bedarf bearbeiten.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session Summary konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  async function saveEditedProposal() {
    if (!draft) return;
    const confirmed = window.confirm("Diesen geprüften Memory-Vorschlag wirklich in project-memory.json speichern?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(`Gespeichert als Memory-Eintrag: ${data.entry.id}`);
      setResult((current) => current ? { ...current, saved: true, savedEntryId: data.entry.id, proposal: draft } : current);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory-Vorschlag konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(field: keyof Proposal, value: string) {
    setDraft((current) => {
      if (!current) return current;
      if (field === "tags") return { ...current, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) };
      return { ...current, [field]: value };
    });
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/memory">Memory Admin</a>
        <a className="nav-link" href="/memory-quality">Memory Quality</a>
        <a className="nav-link" href="/memory-sessions">Session Summary</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Session Summary to Memory</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Erstellt aus aktuellen Logs einen strukturierten Memory-Vorschlag. Der Vorschlag kann vor dem Speichern bearbeitet werden.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}
      {message ? <section style={{ ...cardStyle, borderColor: "#bbf7d0", background: "#f0fdf4" }}>{message}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>1. Vorschlag erzeugen</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="subtle-text">Letzte Logeinträge</span>
            <input style={{ ...inputStyle, width: 140 }} type="number" min={1} max={200} value={limit} onChange={(event) => setLimit(Number(event.target.value))} />
          </label>
          <button style={secondaryButtonStyle} disabled={loading} onClick={generate}>{loading ? "Lädt..." : "Vorschlag erzeugen"}</button>
        </div>
      </section>

      {result && draft ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>2. Vorschlag prüfen und bearbeiten</h2>
          {result.saved ? <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 12 }}>Gespeichert als: <a className="nav-link" href="/memory">{result.savedEntryId}</a></div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div><strong>Logs:</strong> {result.totalLogEntries}</div>
            <div><strong>Memory genutzt:</strong> {result.usedMemoryCount}</div>
            <div><strong>Knowledge genutzt:</strong> {result.usedKnowledgeCount}</div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <div className="subtle-text">Typ</div>
              <select style={inputStyle} value={draft.type} onChange={(event) => updateDraft("type", event.target.value)}>
                <option value="note">note</option>
                <option value="decision">decision</option>
                <option value="milestone">milestone</option>
              </select>
            </label>
            <label>
              <div className="subtle-text">Titel</div>
              <input style={inputStyle} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
            </label>
            <label>
              <div className="subtle-text">Tags, kommagetrennt</div>
              <input style={inputStyle} value={draft.tags.join(", ")} onChange={(event) => updateDraft("tags", event.target.value)} />
            </label>
            <label>
              <div className="subtle-text">Summary</div>
              <textarea style={{ ...inputStyle, minHeight: 180 }} value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} />
            </label>
            <label>
              <div className="subtle-text">Source</div>
              <input style={inputStyle} value={draft.source} onChange={(event) => updateDraft("source", event.target.value)} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button style={buttonStyle} disabled={loading} onClick={saveEditedProposal}>{loading ? "Speichert..." : "Geprüften Vorschlag speichern"}</button>
            <a className="nav-link" href="/memory">Memory Admin öffnen</a>
          </div>

          <h3>Top Memory-Titel</h3>
          <ul>{result.topMemoryTitles.map((title) => <li key={title}>{title}</li>)}</ul>
          <h3>Top Knowledge-Titel</h3>
          <ul>{result.topKnowledgeTitles.map((title) => <li key={title}>{title}</li>)}</ul>
        </section>
      ) : null}
    </main>
  );
}
