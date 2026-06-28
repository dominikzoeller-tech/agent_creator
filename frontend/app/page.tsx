"use client";

import { FormEvent, useEffect, useState } from "react";
import { askAgent, getHealth, getRedactPreview } from "../lib/api-client";
import { AskResponse, DataSensitivity, HealthResponse, ProcessingMode, RedactResponse } from "../lib/types";
import { ChatResponseCard } from "../components/ChatResponseCard";
import { PrivacyRequestPanel } from "../components/PrivacyRequestPanel";
import { RedactPreviewPanel } from "../components/RedactPreviewPanel";
import { DebugResponsePanel } from "../components/DebugResponsePanel";
import { RoutingMetadataPanel } from "../components/RoutingMetadataPanel";
import { KnowledgeHitsPanel } from "../components/KnowledgeHitsPanel";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

export default function Page() {
  const [userInput, setUserInput] = useState("Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?");
  const [sensitivity, setSensitivity] = useState<DataSensitivity>("internal");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("auto");
  const [includeCouncilResult, setIncludeCouncilResult] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [redactPreview, setRedactPreview] = useState<RedactResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [redactLoading, setRedactLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactError, setRedactError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHealth()
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Health konnte nicht geladen werden.");
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await askAgent({
        userInput,
        context: [
          "Phase 6.7 Routing-Metadaten sollen in API/Debug sichtbar sein.",
          "Die UI soll suggestedAgents, routingDetails und routingSummary anzeigen können.",
        ],
        outputMode: "json",
        includeCouncilResult,
        sensitivity,
        processingMode,
        allowCloudForSensitive: false,
      });
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler bei /v1/ask");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedactPreview() {
    setRedactLoading(true);
    setRedactError(null);
    try {
      const preview = await getRedactPreview({
        userInput,
        context: [
          "Phase 6.7 Redaction Preview.",
          "Zeige, wie die API kritische Inhalte vor der Verarbeitung maskieren würde.",
        ],
      });
      setRedactPreview(preview);
    } catch (err) {
      setRedactError(err instanceof Error ? err.message : "Unbekannter Fehler bei /v1/redact");
      setRedactPreview(null);
    } finally {
      setRedactLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="page-shell">
        <section className="hero-card" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #f8fafc 100%)", borderColor: '#fde68a' }}>
          <h1 className="section-title">Phase 6.7 – Routing-Metadaten im Debug</h1>
          <p style={{ margin: "12px 0 0", maxWidth: 940, lineHeight: 1.6 }}>
            Die neuen Agent-/Routing-Metadaten werden jetzt im Frontend sichtbar: vorgeschlagene Agenten,
            Routing-Details, Summary und vollständiges Debug JSON.
          </p>
        </section>

        <div className="stack-grid">
          <section className="panel-card">
            <h2 style={{ marginTop: 0 }}>Chat</h2>
            <p className="helper-text" style={{ marginTop: 0 }}>
              Für Phase 6.7 ist <strong>includeCouncilResult</strong> standardmäßig aktiv, damit neue Routing-Metadaten in der UI sichtbar werden.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>Frage</label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Sensitivität</label>
                  <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value as DataSensitivity)} style={inputStyle}>
                    <option value="public">public</option>
                    <option value="internal">internal</option>
                    <option value="confidential">confidential</option>
                    <option value="restricted">restricted</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Processing Mode</label>
                  <select value={processingMode} onChange={(e) => setProcessingMode(e.target.value as ProcessingMode)} style={inputStyle}>
                    <option value="auto">auto</option>
                    <option value="local_only">local_only</option>
                    <option value="hybrid">hybrid</option>
                    <option value="cloud_allowed">cloud_allowed</option>
                  </select>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                <input type="checkbox" checked={includeCouncilResult} onChange={(e) => setIncludeCouncilResult(e.target.checked)} />
                includeCouncilResult aktivieren
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                <input type="checkbox" checked={showDebug} onChange={(e) => setShowDebug(e.target.checked)} />
                Admin / Debug JSON anzeigen
              </label>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="submit" style={primaryButtonStyle} disabled={loading || !userInput.trim()}>
                  {loading ? "Sende Anfrage…" : "Anfrage senden"}
                </button>
                <button type="button" style={ghostButtonStyle} onClick={handleRedactPreview} disabled={redactLoading || !userInput.trim()}>
                  {redactLoading ? "Prüfe Redaction…" : "Redaction prüfen"}
                </button>
              </div>
            </form>
          </section>

          <aside style={{ display: "grid", gap: 20 }}>
            <section className="panel-card">
              <h2 style={{ marginTop: 0 }}>Systemstatus</h2>
              {health ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div>Status: {health.status}</div>
                  <div>Service: {health.service}</div>
                  <div>Port: {health.port}</div>
                  <div className="subtle-text">Sensitivitäten: {health.modes.sensitivities.join(", ")}</div>
                  <div className="subtle-text">Processing Modes: {health.modes.processingModes.join(", ")}</div>
                </div>
              ) : (
                <div className="helper-text">Health wird geladen…</div>
              )}
            </section>

            <PrivacyRequestPanel
              sensitivity={sensitivity}
              processingMode={processingMode}
              includeCouncilResult={includeCouncilResult}
              response={response}
            />
          </aside>
        </div>

        <RedactPreviewPanel preview={redactPreview} loading={redactLoading} error={redactError} />
        <ChatResponseCard response={response} loading={loading} error={error} />
        <RoutingMetadataPanel response={response} />
                        <KnowledgeHitsPanel response={response} />
<DebugResponsePanel response={response} visible={showDebug} />
      </div>
    </main>
  );
}
