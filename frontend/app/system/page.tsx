"use client";

import { useEffect, useState } from "react";
import { getHealth } from "../../lib/api-client";
import { HealthResponse } from "../../lib/types";
import { SystemHealthPanel } from "../../components/SystemHealthPanel";
import { QuickStartChecklist } from "../../components/QuickStartChecklist";

export default function SystemPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHealth()
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Systemstatus konnte nicht geladen werden.");
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
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
        <a className="nav-link" href="/memory">Memory</a>
        <a className="nav-link" href="/memory-quality">Memory Quality</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/logs">Logs</a>
        <a className="nav-link" href="/system">System</a>
        <a className="nav-link" href="/tools">Tools</a>
        <a className="nav-link" href="/web-research">Web Research</a>
        <a className="nav-link" href="/web-research-settings">Research Settings</a>
              <a className="nav-link" href="/web-research-save">Research speichern</a>
        <a className="nav-link" href="/web-research-governance">Research Governance</a>
      </nav>
      <div className="page-shell">
        <section className="hero-card" style={{ background: 'linear-gradient(135deg, #fae8ff 0%, #f8fafc 100%)', borderColor: '#e9d5ff' }}>
          <h1 className="section-title">Phase 4.9 – System / Betrieb</h1>
          <p style={{ margin: "12px 0 0", maxWidth: 920, lineHeight: 1.6 }}>
            Diese Seite bündelt den Systemstatus deiner Privacy-First API und bietet eine kleine Betriebs-Checkliste,
            damit du API, Frontend und tägliche Nutzung sauber im Blick hast.
          </p>
        </section>

        <div className="stack-grid">
          <SystemHealthPanel health={health} loading={loading} error={error} />
          <QuickStartChecklist />
        </div>
      </div>
    </main>
  );
}
