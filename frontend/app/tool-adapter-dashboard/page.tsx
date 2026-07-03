"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[]; error?: string };
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || "Request failed: " + url);
  return payload;
}
export default function ToolAdapterDashboardPage(){
  const [adapters,setAdapters]=useState<ApiState>({});
  const [plans,setPlans]=useState<ApiState>({});
  const [bindings,setBindings]=useState<ApiState>({});
  const [resumes,setResumes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [adapterPayload, bindingPayload, resumePayload, policyPayload, auditPayload] = await Promise.all([
        fetchJson("/api/tool-adapters?limit=100"),
        fetchJson("/api/tool-adapter-consent"),
        fetchJson("/api/tool-adapter-resume?limit=100"),
        fetchJson("/api/tool-adapter-policy?limit=100"),
        fetchJson("/api/governance-audit?limit=100"),
      ]);
      setAdapters({ summary: adapterPayload.adapterSummary, items: adapterPayload.adapters || [] });
      setPlans({ summary: adapterPayload.planSummary, items: adapterPayload.plans || [] });
      setBindings({ summary: bindingPayload.summary, items: bindingPayload.bindings || [] });
      setResumes({ summary: resumePayload.summary, items: resumePayload.plans || [] });
      setPolicy({ summary: policyPayload.summary, items: policyPayload.simulations || [] });
      setAudit({ summary: auditPayload.summary, items: auditPayload.events || [] });
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const cards = [
    ["Tool Adapters", adapters, "/tool-sandbox"],
    ["Dry-run Plans", plans, "/tool-sandbox"],
    ["Consent Bindings", bindings, "/tool-adapter-consent"],
    ["Resume Plans", resumes, "/tool-adapter-resume"],
    ["Policy Simulations", policy, "/tool-adapter-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-dashboard" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#ecfeff 100%)", borderColor:"#67e8f9" }}><h1 className="section-title">Tool Adapter Dashboard</h1><p style={{ lineHeight:1.6 }}>Phase 13.4 fasst Tool Adapter, Dry-run Plans, Consent Bindings, Resume Plans, Policy Simulationen und Governance Audit zusammen. Keine echte Tool-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Tool Adapter Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>toolExecutionAllowed</strong> bleibt false.</li><li><strong>dryRunOnly</strong> bleibt true.</li><li><strong>Tool Adapter</strong> sind nur Registry-/Plan-/Simulationsobjekte.</li><li><strong>Consent Approval</strong> erlaubt in Phase 13.4 noch keine echte Ausführung.</li></ul></section></div></main>;
}
