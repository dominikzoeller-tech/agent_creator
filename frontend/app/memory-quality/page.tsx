"use client";

import { useEffect, useMemo, useState } from "react";

type Severity = "info" | "warning" | "error";

type MemoryQualityIssue = { code: string; severity: Severity; message: string };
type MemoryQualityEntryReport = {
  id: string;
  type: string;
  title: string;
  tags: string[];
  source?: string;
  summaryLength: number;
  wordCount: number;
  createdAt?: string;
  updatedAt?: string;
  issues: MemoryQualityIssue[];
};
type MemoryQualityReport = {
  ok: true;
  memoryFile: string;
  totalEntries: number;
  entriesWithIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  duplicateTitleGroups: string[][];
  reports: MemoryQualityEntryReport[];
};
type ApiResponse = MemoryQualityReport | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)" };
const metricStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc", padding: 14 };

function severityBg(severity: Severity): string {
  if (severity === "error") return "#fef2f2";
  if (severity === "warning") return "#fffbeb";
  return "#f8fafc";
}

function severityColor(severity: Severity): string {
  if (severity === "error") return "#991b1b";
  if (severity === "warning") return "#92400e";
  return "#334155";
}

export default function MemoryQualityPage() {
  const [report, setReport] = useState<MemoryQualityReport | null>(null);
  const [filter, setFilter] = useState<"issues" | "all">("issues");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/memory-quality", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!data.ok) throw new Error(data.error);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory Quality Report konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReport(); }, []);

  const visibleReports = useMemo(() => {
    if (!report) return [];
    if (filter === "all") return report.reports;
    return report.reports.filter((entry) => entry.issues.length > 0);
  }, [report, filter]);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/memory">Memory Admin</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Memory Quality Checks</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Prüft Project-Memory-Einträge auf fehlende Felder, fehlende Tags, sehr kurze Summaries, doppelte Titel und alte Systemzustände.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Übersicht</h2>
          <button className="nav-link" onClick={loadReport} disabled={loading}>{loading ? "Lädt..." : "Neu prüfen"}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 14 }}>
          <div style={metricStyle}><div className="subtle-text">Einträge</div><strong style={{ fontSize: 24 }}>{report?.totalEntries ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Einträge mit Issues</div><strong style={{ fontSize: 24 }}>{report?.entriesWithIssues ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Errors</div><strong style={{ fontSize: 24 }}>{report?.errorCount ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Warnings</div><strong style={{ fontSize: 24 }}>{report?.warningCount ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Infos</div><strong style={{ fontSize: 24 }}>{report?.infoCount ?? 0}</strong></div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Memory-Reports</h2>
          <select value={filter} onChange={(event) => setFilter(event.target.value as "issues" | "all")}>
            <option value="issues">Nur Einträge mit Issues</option>
            <option value="all">Alle Einträge</option>
          </select>
        </div>

        {!report ? <div className="helper-text">Noch kein Report geladen.</div> : visibleReports.length === 0 ? <div className="helper-text">Keine Einträge für diesen Filter.</div> : (
          <div style={{ display: "grid", gap: 12 }}>
            {visibleReports.map((entry) => (
              <article key={entry.id || entry.title} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{entry.title || "Ohne Titel"}</strong>
                    <div className="subtle-text">{entry.type || "ohne Typ"} · {entry.wordCount} Wörter · {entry.summaryLength} Zeichen</div>
                    {entry.tags.length ? <div className="subtle-text">Tags: {entry.tags.join(", ")}</div> : null}
                  </div>
                  <a className="nav-link" href="/memory">Öffnen</a>
                </div>

                {entry.issues.length ? (
                  <ul style={{ display: "grid", gap: 8, margin: "12px 0 0", padding: 0, listStyle: "none" }}>
                    {entry.issues.map((issue) => (
                      <li key={`${entry.id}-${issue.code}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: severityBg(issue.severity), color: severityColor(issue.severity) }}>
                        <strong>{issue.severity.toUpperCase()} · {issue.code}</strong><br />{issue.message}
                      </li>
                    ))}
                  </ul>
                ) : <div className="helper-text" style={{ marginTop: 12 }}>Keine Issues gefunden.</div>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
