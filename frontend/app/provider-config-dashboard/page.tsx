"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderConfigDashboardPage(){
  const [boundary,setBoundary]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [adapter,setAdapter]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [b,p,a,ga]=await Promise.all([
        fetchJson("/api/provider-config-secret-boundary?limit=200"),
        fetchJson("/api/provider-config-policy?limit=200"),
        fetchJson("/api/provider-llm-adapter-stub?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setBoundary({summary:b.summary,items:b.boundaryChecks||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAdapter({summary:a.summary,items:a.adapterStubs||[]});
      setAudit({summary:ga.summary,items:ga.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Secret Boundary Checks", boundary, "/provider-config-secret-boundary"],
    ["Provider Config Policy", policy, "/provider-config-policy"],
    ["Provider Adapter Stubs", adapter, "/provider-llm-adapter-stub"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-config-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Provider Config Dashboard</h1><p style={{lineHeight:1.6}}>Phase 23.2 fasst Provider Config Secret Boundary Checks, Provider Config Policy Simulationen, Provider Adapter Stubs und Audit zusammen. Keine Secrets und keine Provider-/Netzwerk-Aufrufe.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Config Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>secret_boundary_presence_metadata_only</li><li>noSecretValuesStored=true</li><li>noSecretValuesExposed=true</li><li>nur Presence-/Metadata-Checks</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>keine Tool-Ausführung</li><li>keine Agent-Ausführung</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
