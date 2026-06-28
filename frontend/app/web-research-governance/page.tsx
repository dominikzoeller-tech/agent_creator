"use client";

import { useState } from "react";

type Issue = { code: string; severity: "info" | "warning" | "error"; message: string };
type Report = { ok: true; allowed: boolean; score: number; issueCount: number; errorCount: number; warningCount: number; infoCount: number; issues: Issue[]; deduplicatedSources: Array<{ title?: string; url?: string; source?: string }> };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

function issueBackground(severity: Issue["severity"]): string {
  if (severity === "error") return "#fef2f2";
  if (severity === "warning") return "#fffbeb";
  return "#f8fafc";
}

export default function WebResearchGovernancePage() {
  const [query, setQuery] = useState("Was ist aktuell zu Privacy-first AI Agents relevant?");
  const [summary, setSummary] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [saveKnowledge, setSaveKnowledge] = useState(true);
  const [saveMemory, setSaveMemory] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runGovernance() {
    setError(null);
    const sources = sourceUrls.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((url, index) => ({ title: `Quelle ${index + 1}`, url }));
    const response = await fetch("/api/web-research-governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, summary, sources, results: [], saveKnowledge, saveMemory }),
    });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error ?? "Governance Check fehlgeschlagen.");
      return;
    }
    setReport(data);
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/web-research-save">Research speichern</a>
        <a className="nav-link" href="/web-research">Web Research</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Web Research Governance</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Prüft Web-Research-Inhalte vor der dauerhaften Speicherung auf Qualität, Quellenanzahl, Duplikate und offensichtliche sensible Daten.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Governance Check</h2>
        <label>
          <div className="subtle-text">Query</div>
          <input style={inputStyle} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label style={{ display: "block", marginTop: 12 }}>
          <div className="subtle-text">Summary</div>
          <textarea style={{ ...inputStyle, minHeight: 140 }} value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>
        <label style={{ display: "block", marginTop: 12 }}>
          <div className="subtle-text">Quellen-URLs, eine pro Zeile</div>
          <textarea style={{ ...inputStyle, minHeight: 120 }} value={sourceUrls} onChange={(event) => setSourceUrls(event.target.value)} />
        </label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
          <label><input type="checkbox" checked={saveKnowledge} onChange={(event) => setSaveKnowledge(event.target.checked)} /> Knowledge speichern</label>
          <label><input type="checkbox" checked={saveMemory} onChange={(event) => setSaveMemory(event.target.checked)} /> Memory speichern</label>
        </div>
        <div style={{ marginTop: 14 }}>
          <button style={buttonStyle} onClick={runGovernance}>Governance prüfen</button>
        </div>
      </section>

      {report ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Report</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div><strong>Allowed:</strong> {report.allowed ? "ja" : "nein"}</div>
            <div><strong>Score:</strong> {report.score}</div>
            <div><strong>Errors:</strong> {report.errorCount}</div>
            <div><strong>Warnings:</strong> {report.warningCount}</div>
            <div><strong>Infos:</strong> {report.infoCount}</div>
          </div>

          <h3>Issues</h3>
          {report.issues.length === 0 ? <div className="helper-text">Keine Issues gefunden.</div> : (
            <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
              {report.issues.map((issue) => (
                <li key={issue.code} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: issueBackground(issue.severity) }}>
                  <strong>{issue.severity.toUpperCase()} · {issue.code}</strong><br />{issue.message}
                </li>
              ))}
            </ul>
          )}

          <h3>Deduplizierte Quellen</h3>
          {report.deduplicatedSources.length === 0 ? <div className="helper-text">Keine validen Quellen.</div> : (
            <ul>
              {report.deduplicatedSources.map((source, index) => <li key={`${source.url}-${index}`}>{source.url}</li>)}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
