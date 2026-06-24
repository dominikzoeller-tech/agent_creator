import { DecisionLogEntry } from "../lib/types";

interface LogTableProps {
  entries: DecisionLogEntry[];
  loading?: boolean;
  error?: string | null;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const tdStyle: React.CSSProperties = {
  verticalAlign: "top",
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  lineHeight: 1.45,
};

export function LogTable({ entries, loading = false, error = null }: LogTableProps) {
  if (loading) {
    return <section style={cardStyle}>Logs werden geladen…</section>;
  }

  if (error) {
    return <section style={{ ...cardStyle, borderColor: "#f87171", background: "#fef2f2", color: "#991b1b" }}>{error}</section>;
  }

  if (entries.length === 0) {
    return <section style={cardStyle}>Noch keine Log-Einträge gefunden.</section>;
  }

  return (
    <section style={cardStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Zeit</th>
            <th style={thStyle}>Route</th>
            <th style={thStyle}>Frage</th>
            <th style={thStyle}>Empfehlung</th>
            <th style={thStyle}>Erster Schritt</th>
            <th style={thStyle}>Konfidenz</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={`${entry.timestamp}-${index}`}>
              <td style={tdStyle}>{entry.timestamp}</td>
              <td style={tdStyle}>{entry.route}</td>
              <td style={tdStyle}>{entry.userInput}</td>
              <td style={tdStyle}>{entry.recommendation ?? "-"}</td>
              <td style={tdStyle}>{entry.firstStep ?? "-"}</td>
              <td style={tdStyle}>{typeof entry.confidence === "number" ? `${Math.round(entry.confidence * 100)}%` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
