"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function LlmRoutingDashboardPage(){
  const [recommendations,setRecommendations]=useState<ApiState>({});
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,e,p,a]=await Promise.all([
        fetchJson("/api/master-planner?limit=200"),
        fetchJson("/api/llm-routing-envelope?limit=200"),
        fetchJson("/api/llm-routing-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setRecommendations({summary:r.summary,items:r.recommendations||[]});
      setEnvelopes({summary:e.summary,items:e.envelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards = [
    ["Planner Recommendations", recommendations, "/master-planner"],
    ["LLM Routing Envelopes", envelopes, "/llm-routing-envelope"],
    ["LLM Routing Policy", policy, "/llm-routing-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="llm-routing-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)",borderColor:"#7dd3fc"}}><h1 className="section-title">LLM Routing Dashboard</h1><p style={{lineHeight:1.6}}>Phase 17.2 fasst Planner Recommendations, Controlled LLM Routing Envelopes, Policy Simulationen und Audit zusammen. Kein LLM-Aufruf, keine echte Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>LLM Routing Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>Kein LLM-Aufruf in Phase 17.2.</li><li>Keine echte Tool- oder Agent-Ausführung.</li><li>Sanitized Context only.</li><li>Output Contract bleibt recommendation_explanation_only.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li><li>llmRoutingPrepOnly=true</li></ul></section></div></main>;
}
