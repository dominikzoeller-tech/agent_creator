"use client";

import { useEffect, useState } from "react";
import { AnalyticsResponse } from "../../lib/types";
import { AnalyticsSummary } from "../../components/AnalyticsSummary";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/analytics", { cache: "no-store" })
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
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-wrap">
      <div className="page-shell">
        <section className="hero-card" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #f8fafc 100%)', borderColor: '#bbf7d0' }}>
          <h1 className="section-title">Phase 4.4 – Analytics</h1>
          <p style={{ margin: "12px 0 0", maxWidth: 900, lineHeight: 1.6 }}>
            Diese Seite fasst die wichtigsten Kennzahlen aus deinen Decision Logs zusammen: Direct vs. Council,
            Ø Konfidenz, Top-Empfehlungen, erste Schritte und wiederkehrende Muster.
          </p>
        </section>

        <AnalyticsSummary data={data} loading={loading} error={error} />
      </div>
    </main>
  );
}
