"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type AuditEvent = { id:string; timestamp:string; type:string; actor?:string; entityType:string; entityId?:string; status?:string; riskLevel?:string; summary:string };
export default function GovernanceAuditPage(){
  const [events,setEvents]=useState<AuditEvent[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/governance-audit?limit=300", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Governance Audit konnte nicht geladen werden.");
      setEvents(Array.isArray(payload.events) ? payload.events : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  return <main className="page-wrap"><UnifiedNavigation active="governance-audit" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)", borderColor:"#67e8f9" }}><h1 className="section-title">Governance Audit Trail</h1><p style={{ lineHeight:1.6 }}>Audit Trail für Capability Requests, Agent Blueprint Proposals und Controlled Agent Registry Events.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Events</h2>{events.length===0 ? <p>Noch keine Governance Audit Events.</p> : events.map((event)=><article key={event.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{event.type}</strong> <span className="chip">{event.entityType}</span> {event.status ? <span className="chip">{event.status}</span> : null} {event.riskLevel ? <span className="chip">{event.riskLevel}</span> : null}</div><div className="helper-text"><code>{event.id}</code> · {event.timestamp} · {event.actor}</div><p>{event.summary}</p>{event.entityId ? <p><strong>Entity:</strong> <code>{event.entityId}</code></p> : null}</article>)}</section></div></main>;
}
