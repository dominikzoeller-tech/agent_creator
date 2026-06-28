import { AskResponse } from "../lib/types";

interface ToolConsentPanelProps {
  response: AskResponse | null;
}

type ToolEnforcement = {
  enabled?: boolean;
  dryRun?: boolean;
  wouldBlock?: boolean;
  blockedToolIds?: string[];
  allowedToolIds?: string[];
  confirmationRequiredToolIds?: string[];
  reasons?: string[];
  warnings?: string[];
  mode?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function extractToolEnforcement(response: AskResponse | null): ToolEnforcement | null {
  if (!response || response.ok === false || response.mode !== "cloud") return null;
  const result = response.result as unknown;
  if (!isObject(result)) return null;
  const raw = result.toolEnforcement;
  if (!isObject(raw)) return null;
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : undefined,
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : undefined,
    wouldBlock: typeof raw.wouldBlock === "boolean" ? raw.wouldBlock : undefined,
    blockedToolIds: asStringArray(raw.blockedToolIds),
    allowedToolIds: asStringArray(raw.allowedToolIds),
    confirmationRequiredToolIds: asStringArray(raw.confirmationRequiredToolIds),
    reasons: asStringArray(raw.reasons),
    warnings: asStringArray(raw.warnings),
    mode: typeof raw.mode === "string" ? raw.mode : undefined,
  };
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15,23,42,.04)",
};

const boxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 14,
  background: "#f8fafc",
};

export function ToolConsentPanel({ response }: ToolConsentPanelProps) {
  const enforcement = extractToolEnforcement(response);

  if (!enforcement) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tool Consent</h2>
        <div className="helper-text">Noch keine Consent-/Enforcement-Daten verfügbar.</div>
      </section>
    );
  }

  const requiresConsent = (enforcement.confirmationRequiredToolIds?.length ?? 0) > 0;
  const isHardBlocked = enforcement.mode === "enforce" && enforcement.wouldBlock === true;

  return (
    <section style={{ ...cardStyle, borderColor: isHardBlocked ? "#fecaca" : requiresConsent ? "#fde68a" : "#e5e7eb", background: isHardBlocked ? "#fef2f2" : requiresConsent ? "#fffbeb" : "#ffffff" }}>
      <h2 style={{ marginTop: 0 }}>Tool Consent</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Dieses Panel zeigt, ob die letzte Anfrage eine explizite Tool-Bestätigung bräuchte oder durch harte Enforcement-Regeln blockiert wäre.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        <div style={boxStyle}><div className="subtle-text">Mode</div><strong>{enforcement.mode ?? "unbekannt"}</strong></div>
        <div style={boxStyle}><div className="subtle-text">Would Block</div><strong>{enforcement.wouldBlock ? "ja" : "nein"}</strong></div>
        <div style={boxStyle}><div className="subtle-text">Consent Required</div><strong>{requiresConsent ? "ja" : "nein"}</strong></div>
        <div style={boxStyle}><div className="subtle-text">Dry Run</div><strong>{enforcement.dryRun ? "ja" : "nein"}</strong></div>
      </div>

      {isHardBlocked ? (
        <div style={{ ...boxStyle, marginTop: 14, background: "#fef2f2" }}>
          <strong>Hard Enforcement:</strong> Diese Anfrage wäre im Enforce-Modus blockiert. Die Antwort sollte nicht automatisch Tool-Ausführung starten.
        </div>
      ) : null}

      {requiresConsent ? (
        <div style={{ ...boxStyle, marginTop: 14, background: "#fffbeb" }}>
          <strong>Bestätigung empfohlen für:</strong>
          <ul>{enforcement.confirmationRequiredToolIds?.map((toolId) => <li key={toolId}>{toolId}</li>)}</ul>
        </div>
      ) : null}

      {enforcement.reasons?.length ? (
        <div style={{ ...boxStyle, marginTop: 14, background: "#fef2f2" }}>
          <h3 style={{ marginTop: 0 }}>Blockiergründe</h3>
          <ul>{enforcement.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      ) : null}

      {enforcement.warnings?.length ? (
        <div style={{ ...boxStyle, marginTop: 14, background: "#fffbeb" }}>
          <h3 style={{ marginTop: 0 }}>Warnungen</h3>
          <ul>{enforcement.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      ) : null}
    </section>
  );
}
