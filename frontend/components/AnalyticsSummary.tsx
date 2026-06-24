import { AnalyticsResponse } from "../lib/types";

interface AnalyticsSummaryProps {
  data: AnalyticsResponse | null;
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

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
};

const miniCardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
};

export function AnalyticsSummary({ data, loading = false, error = null }: AnalyticsSummaryProps) {
  if (loading) {
    return <section style={cardStyle}>Analytics werden geladen…</section>;
  }

  if (error) {
    return (
      <section
        style={{
          ...cardStyle,
          borderColor: "#f87171",
          background: "#fef2f2",
          color: "#991b1b",
        }}
      >
        {error}
      </section>
    );
  }

  if (!data || !data.ok) {
    return <section style={cardStyle}>Noch keine Analytics-Daten vorhanden.</section>;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={cardStyle}>
        <div style={statGridStyle}>
          <div style={miniCardStyle}>
            <div style={labelStyle}>Gesamt</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{data.totalEntries}</div>
          </div>
          <div style={miniCardStyle}>
            <div style={labelStyle}>Direct</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{data.directCount}</div>
            <div style={{ color: "#64748b" }}>{data.directSharePercent}%</div>
          </div>
          <div style={miniCardStyle}>
            <div style={labelStyle}>Council</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{data.councilCount}</div>
            <div style={{ color: "#64748b" }}>{data.councilSharePercent}%</div>
          </div>
          <div style={miniCardStyle}>
            <div style={labelStyle}>Ø Konfidenz</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {data.avgCouncilConfidencePercent ?? "-"}
            </div>
            <div style={{ color: "#64748b" }}>
              {data.avgCouncilConfidencePercent !== null ? "%" : "keine Daten"}
            </div>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Top Empfehlungen</h2>
        {data.topRecommendations.length === 0 ? (
          <div>Keine Empfehlungen vorhanden.</div>
        ) : (
          <ul>
            {data.topRecommendations.map((item) => (
              <li key={item.label}>
                {item.label} ({item.count}x)
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Top erste Schritte</h2>
        {data.topFirstSteps.length === 0 ? (
          <div>Keine ersten Schritte vorhanden.</div>
        ) : (
          <ul>
            {data.topFirstSteps.map((item) => (
              <li key={item.label}>
                {item.label} ({item.count}x)
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Top Muster</h2>
        {data.topPatterns.length === 0 ? (
          <div>Keine Muster vorhanden.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {data.topPatterns.map((item, index) => (
              <div key={`${item.pattern}-${index}`} style={miniCardStyle}>
                <div style={{ fontWeight: 700 }}>{item.pattern}</div>
                <div style={{ color: "#64748b", marginTop: 4 }}>
                  {item.count}x · Ø Konfidenz: {item.avgConfidencePercent ?? "-"}
                  {item.avgConfidencePercent !== null ? "%" : ""}
                </div>
                <div style={{ marginTop: 8 }}>{item.exampleQuestion}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
