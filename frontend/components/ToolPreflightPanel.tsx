import { AskResponse } from "../lib/types";

interface ToolPreflightPanelProps {
  response: AskResponse | null;
}

type ToolPreflightDecision = {
  toolId?: string;
  label?: string;
  category?: string;
  candidate?: boolean;
  allowed?: boolean;
  requiresConfirmation?: boolean;
  reasons?: string[];
  warnings?: string[];
};

type ToolPreflight = {
  sensitivity?: string;
  processingMode?: string;
  candidateToolIds?: string[];
  allowedToolIds?: string[];
  blockedToolIds?: string[];
  decisions?: ToolPreflightDecision[];
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15,23,42,.04)",
};

const metricStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#f8fafc",
  padding: 14,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function extractToolPreflight(response: AskResponse | null): ToolPreflight | null {
  if (!response || response.ok === false || response.mode !== "cloud") return null;
  const result = response.result as unknown;
  if (!isObject(result)) return null;
  const raw = result.toolPreflight;
  if (!isObject(raw)) return null;

  const decisions = Array.isArray(raw.decisions)
    ? raw.decisions.filter(isObject).map((decision) => ({
        toolId: typeof decision.toolId === "string" ? decision.toolId : undefined,
        label: typeof decision.label === "string" ? decision.label : undefined,
        category: typeof decision.category === "string" ? decision.category : undefined,
        candidate: typeof decision.candidate === "boolean" ? decision.candidate : undefined,
        allowed: typeof decision.allowed === "boolean" ? decision.allowed : undefined,
        requiresConfirmation: typeof decision.requiresConfirmation === "boolean" ? decision.requiresConfirmation : undefined,
        reasons: asStringArray(decision.reasons),
        warnings: asStringArray(decision.warnings),
      }))
    : [];

  return {
    sensitivity: typeof raw.sensitivity === "string" ? raw.sensitivity : undefined,
    processingMode: typeof raw.processingMode === "string" ? raw.processingMode : undefined,
    candidateToolIds: asStringArray(raw.candidateToolIds),
    allowedToolIds: asStringArray(raw.allowedToolIds),
    blockedToolIds: asStringArray(raw.blockedToolIds),
    decisions,
  };
}

function decisionBackground(decision: ToolPreflightDecision): string {
  if (!decision.candidate) return "#f8fafc";
  return decision.allowed ? "#f0fdf4" : "#fef2f2";
}

function decisionBorder(decision: ToolPreflightDecision): string {
  if (!decision.candidate) return "#e5e7eb";
  return decision.allowed ? "#bbf7d0" : "#fecaca";
}

export function ToolPreflightPanel({ response }: ToolPreflightPanelProps) {
  const preflight = extractToolPreflight(response);

  if (!preflight) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tool Preflight</h2>
        <div className="helper-text">
          Noch keine Tool-Preflight-Daten in der API-Antwort sichtbar. Sobald Phase 10.3 aktiv ist,
          erscheinen hier Tool-Kandidaten, erlaubte Tools, blockierte Tools und Begründungen.
        </div>
      </section>
    );
  }

  const candidateToolIds = preflight.candidateToolIds ?? [];
  const allowedToolIds = preflight.allowedToolIds ?? [];
  const blockedToolIds = preflight.blockedToolIds ?? [];
  const decisions = preflight.decisions ?? [];
  const candidateDecisions = decisions.filter((decision) => decision.candidate);
  const nonCandidateDecisions = decisions.filter((decision) => !decision.candidate);

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Tool Preflight</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Zeigt, welche Tools für die letzte Anfrage erkannt wurden und ob diese Tools nach Sensitivity, Processing Mode und Governance erlaubt wären.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={metricStyle}>
          <div className="subtle-text">Sensitivity</div>
          <strong>{preflight.sensitivity ?? "unbekannt"}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Processing Mode</div>
          <strong>{preflight.processingMode ?? "unbekannt"}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Kandidaten</div>
          <strong>{candidateToolIds.length}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Erlaubt</div>
          <strong>{allowedToolIds.length}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Blockiert</div>
          <strong>{blockedToolIds.length}</strong>
        </div>
      </div>

      <h3>Erkannte Tool-Kandidaten</h3>
      {candidateDecisions.length === 0 ? (
        <div className="helper-text">Für diese Anfrage wurden keine Tool-Kandidaten erkannt.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {candidateDecisions.map((decision) => (
            <article key={decision.toolId} style={{ border: `1px solid ${decisionBorder(decision)}`, borderRadius: 14, padding: 14, background: decisionBackground(decision) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>{decision.label ?? decision.toolId}</strong>
                  <div className="subtle-text">{decision.toolId} · {decision.category ?? "unknown"}</div>
                </div>
                <strong>{decision.allowed ? "ERLAUBT" : "BLOCKIERT"}</strong>
              </div>
              {decision.requiresConfirmation ? <p><strong>Hinweis:</strong> Manuelle Bestätigung empfohlen.</p> : null}
              {decision.reasons?.length ? (
                <>
                  <h4>Blockiergründe</h4>
                  <ul>{decision.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                </>
              ) : null}
              {decision.warnings?.length ? (
                <>
                  <h4>Warnungen</h4>
                  <ul>{decision.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                </>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800 }}>Nicht erkannte Tools anzeigen</summary>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {nonCandidateDecisions.map((decision) => (
            <article key={decision.toolId} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <strong>{decision.label ?? decision.toolId}</strong>
              <div className="helper-text">{decision.warnings?.[0] ?? "Nicht als Kandidat erkannt."}</div>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
