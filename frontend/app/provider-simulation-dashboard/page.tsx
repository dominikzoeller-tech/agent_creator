"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderSimulationDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [readiness,setReadiness]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,p,r,a]=await Promise.all([
        fetchJson("/api/controlled-provider-invocation-simulation-envelope?limit=200"),
        fetchJson("/api/controlled-provider-invocation-simulation-policy?limit=200"),
        fetchJson("/api/provider-invocation-readiness-preflight?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.simulationEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setReadiness({summary:r.summary,items:r.preflights||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Simulation Envelopes", envelopes, "/controlled-provider-invocation-simulation-envelope"],
    ["Simulation Policy", policy, "/controlled-provider-invocation-simulation-policy"],
    ["Readiness Preflights", readiness, "/provider-invocation-readiness-preflight"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-simulation-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Provider Simulation Dashboard</h1><p style={{lineHeight:1.6}}>Phase 25.2 fasst Controlled Provider Invocation Simulation Envelopes, Simulation Policy, Readiness Preflights und Audit zusammen. Kein externer Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Simulation Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_invocation_simulation_envelope_no_external_call</li><li>metadata-only Simulation</li><li>provider=none</li><li>modelSelected=none</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
