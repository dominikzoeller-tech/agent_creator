"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { ok?: boolean; summary?: any; items?: any[]; error?: string };
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || "Request failed: " + url);
  return payload;
}
export default function AgentRuntimeDashboardPage(){
  const [runtime,setRuntime]=useState<ApiState>({});
  const [consent,setConsent]=useState<ApiState>({});
  const [resume,setResume]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [runtimePayload, consentPayload, resumePayload, policyPayload, auditPayload] = await Promise.all([
        fetchJson("/api/agent-runtime?limit=100"),
        fetchJson("/api/agent-runtime-consent"),
        fetchJson("/api/agent-runtime-resume?limit=100"),
        fetchJson("/api/agent-runtime-policy?limit=100"),
        fetchJson("/api/governance-audit?limit=100"),
      ]);
      setRuntime({ ok:true, summary: runtimePayload.summary, items: runtimePayload.envelopes || [] });
      setConsent({ ok:true, summary: consentPayload.summary, items: consentPayload.bindings || [] });
      setResume({ ok:true, summary: resumePayload.summary, items: resumePayload.envelopes || [] });
      setPolicy({ ok:true, summary: policyPayload.summary, items: policyPayload.simulations || [] });
      setAudit({ ok:true, summary: auditPayload.summary, items: auditPayload.events || [] });
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const cards = [
    ["Runtime Envelopes", runtime, "/agent-runtime"],
    ["Runtime Consent Bindings", consent, "/agent-runtime-consent"],
    ["Runtime Resume Envelopes", resume, "/agent-runtime-resume"],
    ["Policy Simulations", policy, "/agent-runtime-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-dashboard" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor:"#c7d2fe" }}><h1 className="section-title">Runtime Dashboard</h1><p style={{ lineHeight:1.6 }}>Phase 12.4 fasst Runtime Envelopes, Consent Bindings, Resume Envelopes, Policy Simulationen und Governance Audit zusammen. Keine echte Tool-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Runtime Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>toolExecutionAllowed</strong> muss weiterhin false bleiben.</li><li><strong>dryRunOnly</strong> muss weiterhin true bleiben.</li><li><strong>Policy Simulationen</strong> sind nur Simulationen.</li><li><strong>Consent Approval</strong> erlaubt in Phase 12.4 noch keine echte Ausführung.</li></ul></section></div></main>;
}
