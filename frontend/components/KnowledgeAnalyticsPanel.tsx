import { AnalyticsResponse, TopItem } from "../lib/types";

interface KnowledgeAnalyticsPanelProps {
  analytics: AnalyticsResponse | null;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
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

export function KnowledgeAnalyticsPanel({ analytics }: KnowledgeAnalyticsPanelProps) {
  if (!analytics) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Knowledge-Analytics</h2>
        <div className="helper-text">Analytics werden geladen oder sind noch nicht verfügbar.</div>
      </section>
    );
  }

  const knowledgeUsedCount = analytics.knowledgeUsedCount ?? 0;
  const knowledgeUsedSharePercent = analytics.knowledgeUsedSharePercent ?? 0;

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Knowledge-Analytics</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Diese Auswertung zeigt, wann lokale Knowledge-Treffer im Agent Flow genutzt wurden.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div style={metricStyle}>
          <div className="subtle-text">Knowledge genutzt</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{knowledgeUsedCount}</div>
        </div>
        <div style={metricStyle}>
          <div className="subtle-text">Knowledge-Anteil</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{knowledgeUsedSharePercent}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <TopItemsList title="Top Knowledge-Dateien" items={analytics.topKnowledgeFiles} />
        <TopItemsList title="Top Knowledge-Tags" items={analytics.topKnowledgeTags} />
      </div>
    </section>
  );
}
