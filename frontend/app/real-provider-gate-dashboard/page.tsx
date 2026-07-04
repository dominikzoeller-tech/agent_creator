"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealProviderGateDashboardPage(){
  const [gates,setGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [simulation,setSimulation]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,s,a]=await Promise.all([
        fetchJson("/api/controlled-real-provider-invocation-gate?limit=200"),
        fetchJson("/api/real-provider-gate-policy?limit=200"),
        fetchJson("/api/controlled-provider-invocation-simulation-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setGates({summary:g.summary,items:g.gates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setSimulation({summary:s.summary,items:s.simulationEnvelopes||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Real Provider Gates", gates, "/controlled-real-provider-invocation-gate"],
    ["Real Gate Policy", policy, "/real-provider-gate-policy"],
    ["Simulation Envelopes", simulation, "/controlled-provider-invocation-simulation-envelope"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-provider-gate-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff1f2 0%,#f8fafc 100%)",borderColor:"#fda4af"}}><h1 className="section-title">Real Provider Gate Dashboard</h1><p style={{lineHeight:1.6}}>Phase 26.2 fasst Controlled Real Provider Invocation Gates, Gate Policy Simulationen, Simulation Envelopes und Audit zusammen. Kein automatischer Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real Provider Gate Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_real_provider_invocation_gate_human_approval_required</li><li>humanApprovalRequired=true</li><li>humanApproved=false</li><li>approvalTokenIssued=false</li><li>providerSelectionAllowed=false</li><li>provider=none</li><li>modelSelected=none</li><li>automaticInvocationAllowed=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
