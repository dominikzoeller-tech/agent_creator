import { RedactResponse } from "../lib/types";

interface RedactPreviewPanelProps {
  preview: RedactResponse | null;
  loading?: boolean;
  error?: string | null;
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
  color: "#64748b",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const boxStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
  whiteSpace: "pre-wrap",
  lineHeight: 1.55,
};

export function RedactPreviewPanel({ preview, loading = false, error = null }: RedactPreviewPanelProps) {
  if (loading) {
    return <section style={cardStyle}>Redaction Preview wird geladen…</section>;
  }

  if (error) {
    return (
      <section style={{ ...cardStyle, borderColor: "#f87171", background: "#fef2f2", color: "#991b1b" }}>
        {error}
      </section>
    );
  }

  if (!preview) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Redact Preview</h2>
        <div style={{ color: "#64748b", lineHeight: 1.55 }}>
          Noch keine Vorschau erzeugt. Klicke auf <strong>Redaction prüfen</strong>, um zu sehen, wie die API sensible Inhalte maskiert.
        </div>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Redact Preview</h2>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <div style={labelStyle}>Original</div>
          <div style={boxStyle}>{preview.original}</div>
        </div>
        <div>
          <div style={labelStyle}>Redacted</div>
          <div style={boxStyle}>{preview.redacted}</div>
        </div>
      </div>
    </section>
  );
}
