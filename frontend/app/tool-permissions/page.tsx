"use client";

import { useEffect, useMemo, useState } from "react";

type Decision = {
  toolId: string;
  label: string;
  category: string;
  allowed: boolean;
  sensitivity: string;
  processingMode: string;
  reasons: string[];
  warnings: string[];
};

type ResponseData = {
  ok: true;
  sensitivity: string;
  processingMode: string;
  totalTools: number;
  allowedTools: number;
  blockedTools: number;
  decisions: Decision[];
};

type ApiResponse = ResponseData | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const metricStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc", padding: 14 };

export default function ToolPermissionsPage() {
  const [sensitivity, setSensitivity] = useState("internal");
  const [processingMode, setProcessingMode] = useState("auto");
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  async function loadMatrix() {
    setError(null);
    const response = await fetch(`/api/tool-permissions?sensitivity=${sensitivity}&processingMode=${processingMode}`, { cache: "no-store" });
    const json = (await response.json()) as ApiResponse;
    if (!json.ok) {
      setError(json.error);
      return;
    }
    setData(json);
  }

  useEffect(() => { loadMatrix(); }, [sensitivity, processingMode]);

  const decisions = useMemo(() => {
    if (!data) return [];
    if (filter === "allowed") return data.decisions.filter((decision) => decision.allowed);
    if (filter === "blocked") return data.decisions.filter((decision) => !decision.allowed);
    return data.decisions;
  }, [data, filter]);

  return (
    <main style={{ maxWidth: 1150, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/tools">Tools</a>
        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>
        <a className="nav-link" href="/tool-preflight">Tool Preflight</a>
        <a className="nav-link" href="/tool-consent">Tool Consent</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Tool Permissions Matrix</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Matrix für Tool-Erlaubnis nach Sensitivity und Processing Mode. Diese Phase dokumentiert und visualisiert Blockierlogik; spätere Phasen integrieren sie in den Agent Flow.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Parameter</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label>
            <div className="subtle-text">Sensitivity</div>
            <select value={sensitivity} onChange={(event) => setSensitivity(event.target.value)}>
              <option value="public">public</option>
              <option value="internal">internal</option>
              <option value="confidential">confidential</option>
            </select>
          </label>
          <label>
            <div className="subtle-text">Processing Mode</div>
            <select value={processingMode} onChange={(event) => setProcessingMode(event.target.value)}>
              <option value="auto">auto</option>
              <option value="local">local</option>
              <option value="cloud">cloud</option>
              <option value="hybrid">hybrid</option>
            </select>
          </label>
          <label>
            <div className="subtle-text">Filter</div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Alle</option>
              <option value="allowed">Nur erlaubt</option>
              <option value="blocked">Nur blockiert</option>
            </select>
          </label>
          <button className="nav-link" onClick={loadMatrix}>Neu berechnen</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Übersicht</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <div style={metricStyle}><div className="subtle-text">Tools gesamt</div><strong style={{ fontSize: 26 }}>{data?.totalTools ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Erlaubt</div><strong style={{ fontSize: 26 }}>{data?.allowedTools ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Blockiert</div><strong style={{ fontSize: 26 }}>{data?.blockedTools ?? 0}</strong></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Entscheidungen</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {decisions.map((decision) => (
            <article key={decision.toolId} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: decision.allowed ? "#f0fdf4" : "#fef2f2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>{decision.label}</strong>
                  <div className="subtle-text">{decision.toolId} · {decision.category}</div>
                </div>
                <strong>{decision.allowed ? "ERLAUBT" : "BLOCKIERT"}</strong>
              </div>
              {decision.reasons.length ? (
                <>
                  <h4>Blockiergründe</h4>
                  <ul>{decision.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                </>
              ) : null}
              {decision.warnings.length ? (
                <>
                  <h4>Warnungen</h4>
                  <ul>{decision.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                </>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
