"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){
  const res=await fetch(url,{cache:"no-store"});
  const payload=await res.json();
  if(!res.ok) throw new Error(payload?.error||url);
  return payload;
}
export default function ProviderAdapterDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [adapterStubs,setAdapterStubs]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,s,p,a]=await Promise.all([
        fetchJson("/api/approved-real-llm-invocation-envelope?limit=200"),
        fetchJson("/api/provider-llm-adapter-stub?limit=200"),
        fetchJson("/api/provider-llm-adapter-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.invocationEnvelopes||[]});
      setAdapterStubs({summary:s.summary,items:s.adapterStubs||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Invocation Envelopes", envelopes, "/approved-real-llm-invocation-envelope"],
    ["Provider Adapter Stubs", adapterStubs, "/provider-llm-adapter-stub"],
    ["Provider Adapter Policy", policy, "/provider-llm-adapter-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-llm-adapter-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Adapter Dashboard</h1><p style={{lineHeight:1.6}}>Phase 22.2 fasst Invocation Envelopes, Provider Adapter Stubs, Provider Adapter Policy Simulationen und Audit zusammen. Kein Netzwerk-/Provider-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Adapter Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>provider_agnostic_no_network_stub</li><li>provider=none</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine Tool-Ausführung.</li><li>Keine Agent-Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
