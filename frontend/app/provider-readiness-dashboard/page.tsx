"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderReadinessDashboardPage(){
  const [preflights,setPreflights]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [config,setConfig]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [p,pol,c,a]=await Promise.all([
        fetchJson("/api/provider-invocation-readiness-preflight?limit=200"),
        fetchJson("/api/provider-readiness-policy?limit=200"),
        fetchJson("/api/provider-config-secret-boundary?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setPreflights({summary:p.summary,items:p.preflights||[]});
      setPolicy({summary:pol.summary,items:pol.simulations||[]});
      setConfig({summary:c.summary,items:c.boundaryChecks||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Readiness Preflights", preflights, "/provider-invocation-readiness-preflight"],
    ["Readiness Policy Simulations", policy, "/provider-readiness-policy"],
    ["Provider Config Boundary", config, "/provider-config-secret-boundary"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-readiness-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Provider Readiness Dashboard</h1><p style={{lineHeight:1.6}}>Phase 24.2 fasst Provider Invocation Readiness Preflights, Readiness Policy Simulationen, Provider Config Boundary und Audit zusammen. Kein Provider-/Netzwerk-Aufruf und kein produktiver LLM-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Readiness Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>provider_invocation_readiness_preflight_no_provider_call</li><li>Operational Defaults nur Metadata</li><li>Output Contract locked</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>keine Tool-Ausführung</li><li>keine Agent-Ausführung</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
