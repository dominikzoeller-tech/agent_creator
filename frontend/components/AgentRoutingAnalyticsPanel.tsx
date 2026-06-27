import { AnalyticsResponse, TopItem } from "../lib/types";

interface AgentRoutingAnalyticsPanelProps {
  analytics: AnalyticsResponse | null;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  margin: 0,
  padding: 0,
  listStyle: "none",
};

function TopItemsList({ title, items }: { title: string; items?: TopItem[] }) {
  const safeItems = items ?? [];

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#f8fafc" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>{title}</h3>
      {safeItems.length === 0 ? (
        <div className="helper-text">Noch keine Daten vorhanden.</div>
      ) : (
        <ul style={listStyle}>
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

export function AgentRoutingAnalyticsPanel({ analytics }: AgentRoutingAnalyticsPanelProps) {
  if (!analytics) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Agenten- und Routing-Analytics</h2>
        <div className="helper-text">Analytics werden geladen oder sind noch nicht verfügbar.</div>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Agenten- und Routing-Analytics</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Diese Auswertung basiert auf den neuen Routing-Metadaten aus den Decision Logs.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <TopItemsList title="Top Suggested Agents" items={analytics.topSuggestedAgents} />
        <TopItemsList title="Top Routing-Komplexitäten" items={analytics.topRoutingComplexities} />
        <TopItemsList title="Top Privacy-Risiken" items={analytics.topPrivacyRisks} />
      </div>
    </section>
  );
}
