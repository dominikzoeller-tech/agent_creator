"use client";

import { useState } from "react";

type ResearchResult = { title?: string; url?: string; snippet?: string; source?: string };
type ResearchSource = { title?: string; url?: string; source?: string };
type ResearchResponse = {
  ok: true;
  enabled: boolean;
  query: string;
  results: ResearchResult[];
  message?: string;
};
type SaveResponse = { ok: true; savedKnowledge?: boolean; savedKnowledgePath?: string; savedMemory?: boolean; savedMemoryId?: string; message: string } | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { ...buttonStyle, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1" };

export default function WebResearchSavePage() {
  const [query, setQuery] = useState("Was ist aktuell zu Privacy-first AI Agents relevant?");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("web-research, research");
  const [saveKnowledge, setSaveKnowledge] = useState(true);
  const [saveMemory, setSaveMemory] = useState(false);
  const [memoryType, setMemoryType] = useState("note");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runResearch() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/web-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, count: 5 }),
      });
      const data = (await response.json()) as ResearchResponse | { ok: false; error: string };
      if (!data.ok) throw new Error(data.error);
      setResults(data.results ?? []);
      setSources((data.results ?? []).map((result) => ({ title: result.title, url: result.url, source: result.source })));
      setSummary(data.results?.length ? `Web Research zu: ${query}\n\nBitte Summary aus Chat/Debug übernehmen oder hier manuell kuratieren.` : (data.message ?? "Keine Ergebnisse."));
      setMessage(data.message ?? "Web Research wurde geladen. Bitte Summary prüfen und speichern.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Web Research konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function saveResearch() {
    const confirmed = window.confirm("Web Research wirklich dauerhaft speichern? Bitte nur geprüfte öffentliche Informationen speichern.");
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/web-research-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          summary,
          results,
          sources,
          saveKnowledge,
          saveMemory,
          memoryType,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const data = (await response.json()) as SaveResponse;
      if (!data.ok) throw new Error(data.error);
      setMessage(`${data.message}${data.savedKnowledgePath ? ` Knowledge: ${data.savedKnowledgePath}` : ""}${data.savedMemoryId ? ` Memory: ${data.savedMemoryId}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Web Research konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/web-research">Web Research</a>
        <a className="nav-link" href="/web-research-governance">Research Governance</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/memory">Memory</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Web Research speichern</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Speichert geprüfte Research-Ergebnisse dauerhaft als Knowledge-Datei und optional als Project-Memory-Eintrag.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}
      {message ? <section style={{ ...cardStyle, borderColor: "#bbf7d0", background: "#f0fdf4", whiteSpace: "pre-wrap" }}>{message}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>1. Research laden</h2>
        <label>
          <div className="subtle-text">Query</div>
          <input style={inputStyle} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div style={{ marginTop: 12 }}>
          <button style={secondaryButtonStyle} disabled={loading} onClick={runResearch}>{loading ? "Lädt..." : "Web Research laden"}</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>2. Prüfen und speichern</h2>
        <label>
          <div className="subtle-text">Summary / kuratierte Notiz</div>
          <textarea style={{ ...inputStyle, minHeight: 180 }} value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>
        <label style={{ display: "block", marginTop: 12 }}>
          <div className="subtle-text">Tags</div>
          <input style={inputStyle} value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
          <label><input type="checkbox" checked={saveKnowledge} onChange={(event) => setSaveKnowledge(event.target.checked)} /> Als Knowledge speichern</label>
          <label><input type="checkbox" checked={saveMemory} onChange={(event) => setSaveMemory(event.target.checked)} /> Als Memory speichern</label>
          <label>
            Memory-Typ:{" "}
            <select value={memoryType} onChange={(event) => setMemoryType(event.target.value)}>
              <option value="note">note</option>
              <option value="decision">decision</option>
              <option value="milestone">milestone</option>
              <option value="system-state">system-state</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 14 }}>
          <button style={buttonStyle} disabled={loading || (!saveKnowledge && !saveMemory)} onClick={saveResearch}>Geprüftes Research speichern</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Research Treffer</h2>
        {results.length === 0 ? <div className="helper-text">Noch keine Treffer geladen.</div> : (
          <div style={{ display: "grid", gap: 12 }}>
            {results.map((result) => (
              <article key={result.url} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <a href={result.url} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>{result.title}</a>
                <div className="subtle-text">{result.source ?? result.url}</div>
                <p>{result.snippet}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
