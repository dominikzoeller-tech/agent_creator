"use client";

import { useEffect, useMemo, useState } from "react";

type ConsentStatus = "pending" | "approved" | "denied" | "expired";
type ConsentRequest = {
  id: string;
  toolId: string;
  status: ConsentStatus;
  reason: string;
  userInputPreview?: string;
  sensitivity?: string;
  processingMode?: string;
  requestedAt: string;
  decidedAt?: string;
  expiresAt?: string;
  decisionNote?: string;
};
type StoreResponse = { ok: true; total: number; pending: number; approved: number; denied: number; expired: number; requests: ConsentRequest[] };
type ApiResponse = StoreResponse | { ok: false; error: string };

const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(15,23,42,.04)" };
const metricStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc", padding: 14 };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" };

function statusBackground(status: ConsentStatus): string {
  if (status === "approved") return "#f0fdf4";
  if (status === "denied") return "#fef2f2";
  if (status === "expired") return "#f8fafc";
  return "#fffbeb";
}

export default function ToolConsentPage() {
  const [data, setData] = useState<StoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [toolId, setToolId] = useState("web-research");
  const [reason, setReason] = useState("Tool-Ausführung benötigt explizite Bestätigung.");
  const [userInputPreview, setUserInputPreview] = useState("Was ist aktuell zu Privacy-first AI Agents relevant?");

  async function load() {
    setError(null);
    const response = await fetch("/api/tool-consent", { cache: "no-store" });
    const json = (await response.json()) as ApiResponse;
    if (!json.ok) { setError(json.error); return; }
    setData(json);
  }

  async function createRequest() {
    setError(null);
    const response = await fetch("/api/tool-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, reason, userInputPreview, sensitivity: "public", processingMode: "auto" }),
    });
    const json = await response.json();
    if (!json.ok) { setError(json.error); return; }
    await load();
  }

  async function decide(id: string, status: "approved" | "denied") {
    setError(null);
    const response = await fetch("/api/tool-consent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, decisionNote: status === "approved" ? "Im UI genehmigt." : "Im UI abgelehnt." }),
    });
    const json = await response.json();
    if (!json.ok) { setError(json.error); return; }
    await load();
  }

  useEffect(() => { load(); }, []);

  const requests = useMemo(() => {
    const all = data?.requests ?? [];
    return filter === "all" ? all : all.filter((request) => request.status === filter);
  }, [data, filter]);

  return (
    <main style={{ maxWidth: 1150, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/tools">Tools</a>
        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>
        <a className="nav-link" href="/tool-preflight">Tool Preflight</a>
        <a className="nav-link" href="/tool-consent">Tool Consent</a>
        <a className="nav-link" href="/analytics">Analytics</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Tool Consent Requests</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>Persistente Consent Requests für bestätigungspflichtige Tool-Ausführung. Phase 11.1 speichert Entscheidungen und macht sie bedienbar.</p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Übersicht</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <div style={metricStyle}><div className="subtle-text">Total</div><strong style={{ fontSize: 26 }}>{data?.total ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Pending</div><strong style={{ fontSize: 26 }}>{data?.pending ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Approved</div><strong style={{ fontSize: 26 }}>{data?.approved ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Denied</div><strong style={{ fontSize: 26 }}>{data?.denied ?? 0}</strong></div>
          <div style={metricStyle}><div className="subtle-text">Expired</div><strong style={{ fontSize: 26 }}>{data?.expired ?? 0}</strong></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Test-Request erstellen</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <label><div className="subtle-text">Tool ID</div><input style={inputStyle} value={toolId} onChange={(event) => setToolId(event.target.value)} /></label>
          <label><div className="subtle-text">Reason</div><input style={inputStyle} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          <label><div className="subtle-text">Input Preview</div><textarea style={{ ...inputStyle, minHeight: 80 }} value={userInputPreview} onChange={(event) => setUserInputPreview(event.target.value)} /></label>
          <button className="nav-link" onClick={createRequest}>Consent Request erstellen</button>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Requests</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Alle</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="expired">Expired</option>
            </select>
            <button className="nav-link" onClick={load}>Neu laden</button>
          </div>
        </div>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {requests.length === 0 ? <div className="helper-text">Keine Requests gefunden.</div> : requests.map((request) => (
            <article key={request.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: statusBackground(request.status) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div><strong>{request.toolId}</strong><div className="subtle-text">{request.id}</div></div>
                <strong>{request.status.toUpperCase()}</strong>
              </div>
              <p>{request.reason}</p>
              {request.userInputPreview ? <pre style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e5e7eb", padding: 12, borderRadius: 12 }}>{request.userInputPreview}</pre> : null}
              <div className="subtle-text">requested: {request.requestedAt} · expires: {request.expiresAt ?? "-"}</div>
              {request.status === "pending" ? (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="nav-link" onClick={() => decide(request.id, "approved")}>Genehmigen</button>
                  <button className="nav-link" onClick={() => decide(request.id, "denied")}>Ablehnen</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
