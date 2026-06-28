"use client";

import { useEffect, useState } from "react";

type SettingsStatus = {
  ok: true;
  webResearchEnabled: boolean;
  bingSearchConfigured: boolean;
  bingEndpointConfigured: boolean;
  bingEndpointHost?: string;
  openAiConfigured: boolean;
  summaryModel: string;
  governanceEnabled: boolean;
  safeMode: boolean;
  notes: string[];
};

type ApiResponse = SettingsStatus | { ok: false; error: string };

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

function label(value: boolean): string {
  return value ? "aktiv / vorhanden" : "inaktiv / fehlt";
}

function color(value: boolean): string {
  return value ? "#166534" : "#991b1b";
}

export default function WebResearchSettingsPage() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    setError(null);
    const response = await fetch("/api/web-research-settings", { cache: "no-store" });
    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      setError(data.error);
      return;
    }
    setStatus(data);
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/web-research">Web Research</a>
        <a className="nav-link" href="/web-research-save">Research speichern</a>
        <a className="nav-link" href="/web-research-governance">Research Governance</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
              <a className="nav-link" href="/web-research-settings">Research Settings</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Web Research Admin / Settings</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Sichtbarer Status der Web-Research-Konfiguration ohne Secrets. API-Keys werden hier bewusst nicht angezeigt.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Status</h2>
          <button className="nav-link" onClick={loadStatus}>Neu laden</button>
        </div>

        {!status ? <div className="helper-text" style={{ marginTop: 12 }}>Status wird geladen.</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 14 }}>
            <div style={metricStyle}>
              <div className="subtle-text">Web Research</div>
              <strong style={{ color: color(status.webResearchEnabled) }}>{label(status.webResearchEnabled)}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">Bing Search API Key</div>
              <strong style={{ color: color(status.bingSearchConfigured) }}>{label(status.bingSearchConfigured)}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">Bing Endpoint</div>
              <strong style={{ color: color(status.bingEndpointConfigured) }}>{status.bingEndpointHost ?? label(false)}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">OpenAI Summary</div>
              <strong style={{ color: color(status.openAiConfigured) }}>{label(status.openAiConfigured)}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">Summary Model</div>
              <strong>{status.summaryModel}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">Governance</div>
              <strong style={{ color: color(status.governanceEnabled) }}>{label(status.governanceEnabled)}</strong>
            </div>
            <div style={metricStyle}>
              <div className="subtle-text">Safe Mode</div>
              <strong style={{ color: color(status.safeMode) }}>{label(status.safeMode)}</strong>
            </div>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Aktivierung</h2>
        <p className="helper-text">Web Research wird aktuell über Environment-Variablen aktiviert. Es gibt bewusst keinen Client-Side-Schalter für Secrets.</p>
        <pre style={{ overflowX: "auto", background: "#0f172a", color: "#e5e7eb", borderRadius: 12, padding: 14 }}>
{`WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
WEB_RESEARCH_GOVERNANCE_ENABLED=true
WEB_RESEARCH_SAFE_MODE=true`}
        </pre>
        <p className="helper-text">Nach Änderungen an der .env-Datei Container neu starten.</p>
        <pre style={{ overflowX: "auto", background: "#0f172a", color: "#e5e7eb", borderRadius: 12, padding: 14 }}>
{`npm run stack:down
npm run stack:up:detached
npm run stack:health`}
        </pre>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Governance-Regeln</h2>
        <ul>
          <li>Keine Speicherung ohne Query.</li>
          <li>Warnung bei fehlender oder sehr kurzer Summary.</li>
          <li>Warnung bei weniger als zwei eindeutigen Quellen.</li>
          <li>Doppelte Quellen werden dedupliziert.</li>
          <li>Offensichtliche Secrets, E-Mails oder Telefonnummern blockieren Speicherung.</li>
          <li>Lokale Quellen wie localhost werden markiert.</li>
          <li>Kein Speicherziel ausgewählt blockiert Speicherung.</li>
        </ul>
      </section>

      {status?.notes?.length ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Hinweise</h2>
          <ul>
            {status.notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
