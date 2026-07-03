"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function LlmStubDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [responses,setResponses]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,r,p,a]=await Promise.all([
        fetchJson("/api/llm-routing-envelope?limit=200"),
        fetchJson("/api/llm-stub-response?limit=200"),
        fetchJson("/api/llm-stub-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.envelopes||[]});
      setResponses({summary:r.summary,items:r.responses||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards = [
    ["LLM Routing Envelopes", envelopes, "/llm-routing-envelope"],
    ["Stub Responses", responses, "/llm-stub-response"],
    ["Stub Policy Simulations", policy, "/llm-stub-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="llm-stub-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">LLM Stub Dashboard</h1><p style={{lineHeight:1.6}}>Phase 18.2 fasst Controlled LLM Routing Envelopes, Dry-run Explainer Responses, Stub Policy Simulationen und Audit zusammen. Kein LLM-Aufruf, keine echte Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Stub Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>llmCallPerformed=false</li><li>stubOnly=true</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine echte Tool- oder Agent-Ausführung.</li><li>Output bleibt Erklärung/Empfehlung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
