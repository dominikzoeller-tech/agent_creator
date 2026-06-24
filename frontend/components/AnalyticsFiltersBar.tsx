import { RouteType } from "../lib/types";

interface AnalyticsFiltersBarProps {
  routeFilter: "all" | RouteType;
  onRouteFilterChange: (value: "all" | RouteType) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const wrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: 12,
  alignItems: "end",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
  color: "#475569",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

export function AnalyticsFiltersBar({ routeFilter, onRouteFilterChange, search, onSearchChange }: AnalyticsFiltersBarProps) {
  return (
    <section className="panel-card">
      <h2 style={{ marginTop: 0 }}>Analytics-Filter</h2>
      <div style={wrapStyle}>
        <div>
          <label style={labelStyle}>Route</label>
          <select value={routeFilter} onChange={(e) => onRouteFilterChange(e.target.value as "all" | RouteType)} style={inputStyle}>
            <option value="all">all</option>
            <option value="direct">direct</option>
            <option value="council">council</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Suche in Frage / Empfehlung</label>
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="z. B. Redaction, Dashboard, CLI" style={inputStyle} />
        </div>
      </div>
    </section>
  );
}
