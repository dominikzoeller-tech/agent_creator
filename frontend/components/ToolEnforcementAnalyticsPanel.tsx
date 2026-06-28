import { AnalyticsResponse, TopItem } from "../lib/types";

interface ToolEnforcementAnalyticsPanelProps {
  analytics: AnalyticsResponse | null;
}

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

function TopItemsList({ title, items }: { title: string; items?: TopItem[] }) {
  const safeItems = items ?? [];
  return (
    <div style={metricStyle}>
      <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>{title}</h3>
      {safeItems.length === 0 ? (
        <div className="helper-text">Noch keine Daten vorhanden.</div>
      ) : (
        <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
          {safeItems.map((item) => (
            <li key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontWeight: 700 }}>{item.label}</span>
              <span style={{ color: "#475569" }}>{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ToolEnforcementAnalyticsPanel({ analytics }: ToolEnforcementAnalyticsPanelProps) {
  if (!analytics) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tool-Enforcement-Analytics</h2>
        <div className="helper-text">Analytics werden geladen oder sind noch nicht verfügbar.</div>
      </section>
    );
  }

  const entries = analytics.toolEnforcementEntriesCount ?? 0;
  const wouldBlock = analytics.toolEnforcementWouldBlockCount ?? 0;
  const wouldBlockShare = analytics.toolEnforcementWouldBlockSharePercent ?? 0;
  const dryRun = analytics.toolEnforcementDryRunCount ?? 0;
  const enforce = analytics.toolEnforcementEnforceModeCount ?? 0;
  const off = analytics.toolEnforcementOffModeCount ?? 0;
  const confirmations = analytics.toolEnforcementConfirmationRequiredCount ?? 0;

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Tool-Enforcement-Analytics</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Diese Auswertung zeigt, wie oft Enforcement vorbereitet wurde, wie oft der Agent im Dry-Run blockieren würde und welche Tools/Gründe betroffen sind.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div style={metricStyle}><div className="subtle-text">Enforcement Logs</div><div style={{ fontSize: 28, fontWeight: 800 }}>{entries}</div></div>
        <div style={metricStyle}><div className="subtle-text">Would Block</div><div style={{ fontSize: 28, fontWeight: 800 }}>{wouldBlock}</div></div>
        <div style={metricStyle}><div className="subtle-text">Would-Block-Quote</div><div style={{ fontSize: 28, fontWeight: 800 }}>{wouldBlockShare}%</div></div>
        <div style={metricStyle}><div className="subtle-text">Dry-Run</div><div style={{ fontSize: 28, fontWeight: 800 }}>{dryRun}</div></div>
        <div style={metricStyle}><div className="subtle-text">Enforce Mode</div><div style={{ fontSize: 28, fontWeight: 800 }}>{enforce}</div></div>
        <div style={metricStyle}><div className="subtle-text">Off Mode</div><div style={{ fontSize: 28, fontWeight: 800 }}>{off}</div></div>
        <div style={metricStyle}><div className="subtle-text">Confirmations</div><div style={{ fontSize: 28, fontWeight: 800 }}>{confirmations}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <TopItemsList title="Top blockierte Tools" items={analytics.topToolEnforcementBlockedTools} />
        <TopItemsList title="Top erlaubte Tools" items={analytics.topToolEnforcementAllowedTools} />
        <TopItemsList title="Top Confirmation Tools" items={analytics.topToolEnforcementConfirmationTools} />
        <TopItemsList title="Top Enforcement Gründe" items={analytics.topToolEnforcementReasons} />
        <TopItemsList title="Top Enforcement Warnungen" items={analytics.topToolEnforcementWarnings} />
        <TopItemsList title="Top Enforcement Modi" items={analytics.topToolEnforcementModes} />
      </div>
    </section>
  );
}
