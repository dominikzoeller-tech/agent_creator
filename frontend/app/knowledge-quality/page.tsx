"use client";

import { useEffect, useMemo, useState } from "react";

type IssueSeverity = "info" | "warning" | "error";

type KnowledgeQualityIssue = {
  code: string;
  severity: IssueSeverity;
  message: string;
};

type KnowledgeQualityFileReport = {
  fileName: string;
  title: string;
  tags: string[];
  size: number;
  updatedAt: string;
  wordCount: number;
  lineCount: number;
  issues: KnowledgeQualityIssue[];
};

type KnowledgeQualityReport = {
  ok: true;
  knowledgeDir: string;
  totalFiles: number;
  filesWithIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  duplicateTitleGroups: string[][];
  duplicateContentGroups: string[][];
  files: KnowledgeQualityFileReport[];
};

type ApiResponse = KnowledgeQualityReport | { ok: false; error: string };

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const metricStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#f8fafc",
  padding: 14,
};

function severityColor(severity: IssueSeverity): string {
  if (severity === "error") return "#991b1b";
  if (severity === "warning") return "#92400e";
  return "#334155";
}

function severityBg(severity: IssueSeverity): string {
  if (severity === "error") return "#fef2f2";
  if (severity === "warning") return "#fffbeb";
  return "#f8fafc";
}

export default function KnowledgeQualityPage() {
  const [report, setReport] = useState<KnowledgeQualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "issues">("issues");

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/knowledge-quality", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!data.ok) throw new Error(data.error);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge Quality Report konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const visibleFiles = useMemo(() => {
    if (!report) return [];
    if (filter === "all") return report.files;
    return report.files.filter((file) => file.issues.length > 0);
  }, [report, filter]);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Knowledge Quality Checks</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Prüft lokale Knowledge-Dateien auf fehlende Titel, fehlende Tags, sehr kurze Inhalte und mögliche Duplikate.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Übersicht</h2>
          <button className="nav-link" onClick={loadReport} disabled={loading}>{loading ? "Lädt..." : "Neu prüfen"}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 14 }}>
          <div style={metricStyle}><div className="subtle-text">Dateien</div><strong style={{ fontSize: 24 }}>{report?.totalFiles ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Dateien mit Issues</div><strong style={{ fontSize: 24 }}>{report?.filesWithIssues ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Errors</div><strong style={{ fontSize: 24 }}>{report?.errorCount ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Warnings</div><strong style={{ fontSize: 24 }}>{report?.warningCount ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Infos</div><strong style={{ fontSize: 24 }}>{report?.infoCount ?? 0}</strong></div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Datei-Reports</h2>
          <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | "issues")}>
            <option value="issues">Nur Dateien mit Issues</option>
            <option value="all">Alle Dateien</option>
          </select>
        </div>

        {!report ? (
          <div className="helper-text">Noch kein Report geladen.</div>
        ) : visibleFiles.length === 0 ? (
          <div className="helper-text">Keine Dateien für diesen Filter.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visibleFiles.map((file) => (
              <article key={file.fileName} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{file.title}</strong>
                    <div className="subtle-text">{file.fileName} · {file.wordCount} Wörter · {file.lineCount} Zeilen</div>
                    {file.tags.length ? <div className="subtle-text">Tags: {file.tags.join(", ")}</div> : null}
                  </div>
                  <a className="nav-link" href={`/knowledge?file=${encodeURIComponent(file.fileName)}`}>Öffnen</a>
                </div>

                {file.issues.length ? (
                  <ul style={{ display: "grid", gap: 8, margin: "12px 0 0", padding: 0, listStyle: "none" }}>
                    {file.issues.map((issue) => (
                      <li key={`${file.fileName}-${issue.code}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: severityBg(issue.severity), color: severityColor(issue.severity) }}>
                        <strong>{issue.severity.toUpperCase()} · {issue.code}</strong><br />
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="helper-text" style={{ marginTop: 12 }}>Keine Issues gefunden.</div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
