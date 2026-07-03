"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealLlmGateDashboardPage(){
  const [stubResponses,setStubResponses]=useState<ApiState>({});
  const [gates,setGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,g,p,a]=await Promise.all([
        fetchJson("/api/llm-stub-response?limit=200"),
        fetchJson("/api/real-llm-call-gate?limit=200"),
        fetchJson("/api/real-llm-gate-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setStubResponses({summary:r.summary,items:r.responses||[]});
      setGates({summary:g.summary,items:g.gates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Stub Responses", stubResponses, "/llm-stub-response"],
    ["Real LLM Call Gates", gates, "/real-llm-call-gate"],
    ["Gate Policy Simulations", policy, "/real-llm-gate-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-llm-gate-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Real LLM Gate Dashboard</h1><p style={{lineHeight:1.6}}>Phase 19.2 fasst Stub Responses, Real LLM Call Gates, Gate Policy Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real LLM Gate Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>policyGateRequired=true</li><li>Kein produktiver LLM-Aufruf.</li><li>Secret Scan, Output Contract und Audit bleiben Pflicht vor echter Invocation.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
