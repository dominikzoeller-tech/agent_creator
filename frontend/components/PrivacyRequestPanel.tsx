import { AskResponse, DataSensitivity, ProcessingMode } from "../lib/types";

interface PrivacyRequestPanelProps {
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  includeCouncilResult: boolean;
  response: AskResponse | null;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const valueStyle: React.CSSProperties = {
  fontWeight: 600,
};

export function PrivacyRequestPanel({
  sensitivity,
  processingMode,
  includeCouncilResult,
  response,
}: PrivacyRequestPanelProps) {
  const mode = response && response.ok ? response.mode : "-";
  const processingPath = response && response.ok ? response.processingPath : "-";
  const redacted = response && response.ok && response.mode === "cloud" ? (response.redacted ? "ja" : "nein") : "-";
  const route =
    response && response.ok
      ? response.mode === "cloud"
        ? response.result.route
        : response.routeSuggestion
      : "-";

  const reason =
    response && response.ok && response.mode === "local_policy"
      ? response.reason
      : response && response.ok && response.mode === "cloud"
        ? response.redacted
          ? "Die API hat die Anfrage vor der Cloud-Verarbeitung maskiert."
          : "Die Anfrage durfte ohne Redaction an den Cloud-Pfad gehen."
        : "Noch keine API-Antwort vorhanden.";

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Privacy-Panel</h2>

      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <div style={labelStyle}>Aktuelle Anfrageeinstellungen</div>
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Sensitivität: <span style={valueStyle}>{sensitivity}</span>
            </div>
            <div>
              Processing Mode: <span style={valueStyle}>{processingMode}</span>
            </div>
            <div>
              includeCouncilResult: <span style={valueStyle}>{includeCouncilResult ? "aktiv" : "aus"}</span>
            </div>
          </div>
        </div>

        <div>
          <div style={labelStyle}>API-Entscheidung</div>
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Mode: <span style={valueStyle}>{String(mode)}</span>
            </div>
            <div>
              Processing Path: <span style={valueStyle}>{String(processingPath)}</span>
            </div>
            <div>
              Route: <span style={valueStyle}>{String(route)}</span>
            </div>
            <div>
              Redaction: <span style={valueStyle}>{redacted}</span>
            </div>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Kurzbegründung</div>
          <div style={{ lineHeight: 1.55 }}>{reason}</div>
        </div>
      </div>
    </section>
  );
}
