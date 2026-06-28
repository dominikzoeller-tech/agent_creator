import { AskResponse } from "../lib/types";

interface ToolEnforcementPanelProps {
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
  mode?: "off" | "dry-run" | "enforce" | string;
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

function prettyBoolean(value: boolean | undefined): string {
  if (value === true) return "ja";
  if (value === false) return "nein";
  return "unbekannt";
}

function modeBackground(mode: string | undefined, wouldBlock: boolean | undefined): string {
  if (mode === "enforce" && wouldBlock) return "#fef2f2";
  if (mode === "dry-run" && wouldBlock) return "#fffbeb";
  if (mode === "off") return "#f8fafc";
  return "#f0fdf4";
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

function ToolList({ title, items }: { title: string; items?: string[] }) {
  const safeItems = items ?? [];
  return (
    <div style={metricStyle}>
      <div className="subtle-text">{title}</div>
      {safeItems.length === 0 ? (
        <div className="helper-text">Keine Einträge.</div>
      ) : (
        <ul style={{ marginBottom: 0 }}>
          {safeItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
    </div>
  );
}

export function ToolEnforcementPanel({ response }: ToolEnforcementPanelProps) {
  const enforcement = extractToolEnforcement(response);

  if (!enforcement) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tool Enforcement</h2>
        <div className="helper-text">
          Noch keine Tool-Enforcement-Daten in der API-Antwort sichtbar. Sobald Phase 10.6 aktiv ist,
          erscheinen hier Enforcement-Modus, Dry-Run, wouldBlock, Gründe und Warnungen.
        </div>
      </section>
    );
  }

  return (
    <section style={{ ...cardStyle, background: modeBackground(enforcement.mode, enforcement.wouldBlock) }}>
      <h2 style={{ marginTop: 0 }}>Tool Enforcement</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Zeigt, ob die Tool-Permission-Auswertung später blockieren würde. In Phase 10.7 ist das weiterhin nur sichtbar, nicht automatisch hart blockierend.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={metricStyle}>
          <div className="subtle-text">Mode</div>
          <strong>{enforcement.mode ?? "unbekannt"}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Enforcement aktiv</div>
          <strong>{prettyBoolean(enforcement.enabled)}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Dry Run</div>
          <strong>{prettyBoolean(enforcement.dryRun)}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Would Block</div>
          <strong>{prettyBoolean(enforcement.wouldBlock)}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Blockierte Tools</div>
          <strong>{enforcement.blockedToolIds?.length ?? 0}</strong>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Confirmation nötig</div>
          <strong>{enforcement.confirmationRequiredToolIds?.length ?? 0}</strong>
        </div>
      </div>

      {enforcement.mode === "off" ? (
        <div style={{ ...metricStyle, marginBottom: 14 }}>
          <strong>Status:</strong> Enforcement ist deaktiviert. Die Anzeige dient aktuell nur zur Beobachtung und Vorbereitung.
        </div>
      ) : null}

      {enforcement.mode === "dry-run" ? (
        <div style={{ ...metricStyle, marginBottom: 14, background: "#fffbeb" }}>
          <strong>Dry Run:</strong> Der Agent berechnet Blockierungen, blockiert aber noch nicht hart.
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <ToolList title="Erlaubte Tools" items={enforcement.allowedToolIds} />
        <ToolList title="Blockierte Tools" items={enforcement.blockedToolIds} />
        <ToolList title="Confirmation Required" items={enforcement.confirmationRequiredToolIds} />
      </div>

      {enforcement.reasons?.length ? (
        <div style={{ ...metricStyle, marginTop: 14, background: "#fef2f2" }}>
          <h3 style={{ marginTop: 0 }}>Blockiergründe</h3>
          <ul>{enforcement.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      ) : null}

      {enforcement.warnings?.length ? (
        <div style={{ ...metricStyle, marginTop: 14, background: "#fffbeb" }}>
          <h3 style={{ marginTop: 0 }}>Warnungen</h3>
          <ul>{enforcement.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      ) : null}
    </section>
  );
}
