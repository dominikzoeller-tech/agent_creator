"use client";

import { useEffect, useState } from "react";
import { AnalyticsResponse, ExportFileEntry, RouteType } from "../../lib/types";
import { AnalyticsSummary } from "../../components/AnalyticsSummary";
import { AnalyticsFiltersBar } from "../../components/AnalyticsFiltersBar";
import { ExportsPanel } from "../../components/ExportsPanel";
import { AgentRoutingAnalyticsPanel } from "../../components/AgentRoutingAnalyticsPanel";
import { KnowledgeAnalyticsPanel } from "../../components/KnowledgeAnalyticsPanel";
import { MemoryAnalyticsPanel } from "../../components/MemoryAnalyticsPanel";
import { WebResearchAnalyticsPanel } from "../../components/WebResearchAnalyticsPanel";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<"all" | RouteType>("all");
  const [search, setSearch] = useState("");
  const [exportsFiles, setExportsFiles] = useState<ExportFileEntry[]>([]);
  const [exportsLoading, setExportsLoading] = useState(true);
  const [exportsError, setExportsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ route: routeFilter, search });

    fetch(`/api/analytics?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Analytics konnten nicht geladen werden.");
        if (active) setData(payload as AnalyticsResponse);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Laden der Analytics");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [routeFilter, search]);

  useEffect(() => {
    let active = true;
    setExportsLoading(true);
    setExportsError(null);

    fetch(`/api/exports`, { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Exports konnten nicht geladen werden.");
        if (active) setExportsFiles(Array.isArray(payload.files) ? payload.files : []);
      })
      .catch((err) => {
        if (active) setExportsError(err instanceof Error ? err.message : "Unbekannter Fehler beim Laden der Exports");
      })
      .finally(() => {
        if (active) setExportsLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="page-wrap">
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
        <a className="nav-link" href="/memory">Memory</a>
        <a className="nav-link" href="/memory-quality">Memory Quality</a>
        <a className="nav-link" href="/memory-sessions">Session Summary</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/logs">Logs</a>
        <a className="nav-link" href="/system">System</a>
        <a className="nav-link" href="/web-research">Web Research</a>
              <a className="nav-link" href="/web-research-save">Research speichern</a>
        <a className="nav-link" href="/web-research-governance">Research Governance</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
      </nav>
      <div className="page-shell">
        <section className="hero-card" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #f8fafc 100%)', borderColor: '#bbf7d0' }}>
          <h1 className="section-title">Phase 4.8 – Analytics & Exporte</h1>
          <p style={{ margin: "12px 0 0", maxWidth: 900, lineHeight: 1.6 }}>
            Diese Seite fasst Kennzahlen aus deinen Decision Logs zusammen und zeigt zusätzlich vorhandene CSV-/Excel-Exporte an,
            damit du Berichte direkt aus der UI herunterladen kannst.
          </p>
        </section>

        <AnalyticsFiltersBar
          routeFilter={routeFilter}
          onRouteFilterChange={setRouteFilter}
          search={search}
          onSearchChange={setSearch}
        />

        <AnalyticsSummary data={data} loading={loading} error={error} />
        <ExportsPanel files={exportsFiles} loading={exportsLoading} error={exportsError} />
      </div>
    
        <AgentRoutingAnalyticsPanel analytics={data} />
        <KnowledgeAnalyticsPanel analytics={data} />
        <MemoryAnalyticsPanel analytics={data} />
        <WebResearchAnalyticsPanel analytics={data} />

</main>
  );
}
