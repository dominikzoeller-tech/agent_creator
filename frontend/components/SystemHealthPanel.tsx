import { HealthResponse } from "../lib/types";

interface SystemHealthPanelProps {
  health: HealthResponse | null;
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

const itemStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
};

export function SystemHealthPanel({ health, loading = false, error = null }: SystemHealthPanelProps) {
  if (loading) {
    return <section className="panel-card">Systemstatus wird geladen…</section>;
  }

  if (error) {
    return (
      <section className="panel-card" style={{ borderColor: "#f87171", background: "#fef2f2", color: "#991b1b" }}>
        {error}
      </section>
    );
  }

  if (!health) {
    return <section className="panel-card">Keine Health-Daten vorhanden.</section>;
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Health / API</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Status</div>
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800 }}>{health.status}</div>
          <div style={{ color: "#64748b", marginTop: 4 }}>{health.service}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={itemStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Port</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>{health.port}</div>
          </div>
          <div style={itemStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Sensitivitäten</div>
            <div style={{ marginTop: 6, lineHeight: 1.45 }}>{health.modes.sensitivities.join(", ")}</div>
          </div>
        </div>

        <div style={itemStyle}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Processing Modes</div>
          <div style={{ marginTop: 6, lineHeight: 1.55 }}>{health.modes.processingModes.join(", ")}</div>
        </div>

        <div style={itemStyle}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Processing Paths</div>
          <div style={{ marginTop: 6, lineHeight: 1.55 }}>{health.modes.processingPaths.join(", ")}</div>
        </div>
      </div>
    </section>
  );
}
