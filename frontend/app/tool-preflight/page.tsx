"use client";

import { useState } from "react";

type PreflightResult = {
  ok: true;
  toolId: string;
  found: boolean;
  allowed: boolean;
  requiresConfirmation: boolean;
  sensitivity: string;
  processingMode: string;
  reasons: string[];
  warnings: string[];
  debug: { userInputLength: number; externalNetwork: boolean; writesData: boolean; riskLevel?: string };
};

type ApiResponse = PreflightResult | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };
const buttonStyle: React.CSSProperties = { border: "1px solid #0f172a", background: "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function ToolPreflightPage() {
  const [toolId, setToolId] = useState("web-research");
  const [sensitivity, setSensitivity] = useState("internal");
  const [processingMode, setProcessingMode] = useState("auto");
  const [requireConfirmation, setRequireConfirmation] = useState(false);
  const [userInput, setUserInput] = useState("Was ist aktuell zu Privacy-first AI Agents relevant?");
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPreflight() {
    setError(null);
    const response = await fetch("/api/tool-preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, sensitivity, processingMode, userInput, requireConfirmation }),
    });
    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      setError(data.error);
      return;
    }
    setResult(data);
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/tools">Tools</a>
        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>
        <a className="nav-link" href="/tool-preflight">Tool Preflight</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Tool Permission Preflight</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Prüft ein einzelnes Tool gegen Sensitivity, Processing Mode und User Input. Diese Preflight-Antwort bereitet die spätere Agent-Flow-Integration vor.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Parameter</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div className="subtle-text">Tool ID</div>
            <select style={inputStyle} value={toolId} onChange={(event) => setToolId(event.target.value)}>
              <option value="chat-agent">chat-agent</option>
              <option value="knowledge-search">knowledge-search</option>
              <option value="knowledge-admin">knowledge-admin</option>
              <option value="project-memory">project-memory</option>
              <option value="web-research">web-research</option>
              <option value="web-research-save">web-research-save</option>
              <option value="analytics">analytics</option>
              <option value="system-status">system-status</option>
            </select>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <label>
              <div className="subtle-text">Sensitivity</div>
              <select style={inputStyle} value={sensitivity} onChange={(event) => setSensitivity(event.target.value)}>
                <option value="public">public</option>
                <option value="internal">internal</option>
                <option value="confidential">confidential</option>
              </select>
            </label>
            <label>
              <div className="subtle-text">Processing Mode</div>
              <select style={inputStyle} value={processingMode} onChange={(event) => setProcessingMode(event.target.value)}>
                <option value="auto">auto</option>
                <option value="local">local</option>
                <option value="cloud">cloud</option>
                <option value="hybrid">hybrid</option>
              </select>
            </label>
          </div>
          <label>
            <div className="subtle-text">User Input / Query</div>
            <textarea style={{ ...inputStyle, minHeight: 120 }} value={userInput} onChange={(event) => setUserInput(event.target.value)} />
          </label>
          <label>
            <input type="checkbox" checked={requireConfirmation} onChange={(event) => setRequireConfirmation(event.target.checked)} /> Manuelle Bestätigung erzwingen
          </label>
          <div>
            <button style={buttonStyle} onClick={runPreflight}>Preflight prüfen</button>
          </div>
        </div>
      </section>

      {result ? (
        <section style={{ ...cardStyle, borderColor: result.allowed ? "#bbf7d0" : "#fecaca", background: result.allowed ? "#f0fdf4" : "#fef2f2" }}>
          <h2 style={{ marginTop: 0 }}>Preflight Ergebnis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div><strong>Found:</strong> {String(result.found)}</div>
            <div><strong>Allowed:</strong> {String(result.allowed)}</div>
            <div><strong>Confirmation:</strong> {String(result.requiresConfirmation)}</div>
            <div><strong>Risk:</strong> {result.debug.riskLevel ?? "unknown"}</div>
            <div><strong>External:</strong> {String(result.debug.externalNetwork)}</div>
            <div><strong>Writes:</strong> {String(result.debug.writesData)}</div>
          </div>

          {result.reasons.length ? (
            <>
              <h3>Blockiergründe</h3>
              <ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </>
          ) : null}

          {result.warnings.length ? (
            <>
              <h3>Warnungen</h3>
              <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </>
          ) : null}

          <h3>JSON</h3>
          <pre style={{ overflowX: "auto", background: "#0f172a", color: "#e5e7eb", borderRadius: 12, padding: 14 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}
