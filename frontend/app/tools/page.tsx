"use client";

import { useEffect, useMemo, useState } from "react";

type ToolRiskLevel = "low" | "medium" | "high";
type ToolCategory = "core" | "knowledge" | "memory" | "web-research" | "analytics" | "system";

type ToolDefinition = {
  id: string;
  label: string;
  description: string;
  category: ToolCategory;
  route?: string;
  apiRoute?: string;
  enabled: boolean;
  requiresExternalNetwork: boolean;
  requiresSecret: boolean;
  writesData: boolean;
  riskLevel: ToolRiskLevel;
  allowedSensitivity: string[];
  governanceNotes: string[];
};

type RegistryResponse = {
  ok: true;
  totalTools: number;
  enabledTools: number;
  externalNetworkTools: number;
  writeTools: number;
  tools: ToolDefinition[];
};

type ApiResponse = RegistryResponse | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const metricStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc", padding: 14 };

function riskColor(risk: ToolRiskLevel): string {
  if (risk === "high") return "#991b1b";
  if (risk === "medium") return "#92400e";
  return "#166534";
}

export default function ToolsPage() {
  const [registry, setRegistry] = useState<RegistryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");

  async function loadRegistry() {
    setError(null);
    const response = await fetch("/api/tools", { cache: "no-store" });
    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      setError(data.error);
      return;
    }
    setRegistry(data);
  }

  useEffect(() => { loadRegistry(); }, []);

  const tools = useMemo(() => {
    if (!registry) return [];
    return category ? registry.tools.filter((tool) => tool.category === category) : registry.tools;
  }, [registry, category]);

  return (
    <main style={{ maxWidth: 1150, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/tools">Tools</a>
        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>
        <a className="nav-link" href="/tool-preflight">Tool Preflight</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Tool Registry</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Übersicht über verfügbare Agent-Tools, Risiken, Schreibzugriffe, externe Netzwerkzugriffe und Governance-Hinweise.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Übersicht</h2>
          <button className="nav-link" onClick={loadRegistry}>Neu laden</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 14 }}>
          <div style={metricStyle}><div className="subtle-text">Tools gesamt</div><strong style={{ fontSize: 26 }}>{registry?.totalTools ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Aktiviert</div><strong style={{ fontSize: 26 }}>{registry?.enabledTools ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Externe Netzwerktools</div><strong style={{ fontSize: 26 }}>{registry?.externalNetworkTools ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Schreibende Tools</div><strong style={{ fontSize: 26 }}>{registry?.writeTools ?? 0}</strong></div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Tools</h2>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Alle Kategorien</option>
            <option value="core">core</option>
            <option value="knowledge">knowledge</option>
            <option value="memory">memory</option>
            <option value="web-research">web-research</option>
            <option value="analytics">analytics</option>
            <option value="system">system</option>
          </select>
        </div>

        {tools.length === 0 ? <div className="helper-text">Keine Tools gefunden.</div> : (
          <div style={{ display: "grid", gap: 12 }}>
            {tools.map((tool) => (
              <article key={tool.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{tool.label}</strong>
                    <div className="subtle-text">{tool.id} · {tool.category}</div>
                  </div>
                  <div style={{ color: riskColor(tool.riskLevel), fontWeight: 800 }}>{tool.riskLevel.toUpperCase()}</div>
                </div>
                <p>{tool.description}</p>
                <div className="subtle-text">
                  Enabled: {String(tool.enabled)} · External: {String(tool.requiresExternalNetwork)} · Secret: {String(tool.requiresSecret)} · Writes: {String(tool.writesData)}
                </div>
                {tool.route ? <div><a className="nav-link" href={tool.route}>Öffnen</a></div> : null}
                <h4>Governance</h4>
                <ul>
                  {tool.governanceNotes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
