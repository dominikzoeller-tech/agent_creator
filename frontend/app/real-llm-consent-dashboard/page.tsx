"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealLlmConsentDashboardPage(){
  const [gates,setGates]=useState<ApiState>({});
  const [consentRequests,setConsentRequests]=useState<ApiState>({});
  const [decisions,setDecisions]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,c,d,a]=await Promise.all([
        fetchJson("/api/real-llm-call-gate?limit=200"),
        fetchJson("/api/real-llm-consent?limit=200"),
        fetchJson("/api/real-llm-consent-decision?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setGates({summary:g.summary,items:g.gates||[]});
      setConsentRequests({summary:c.summary,items:c.consentRequests||[]});
      setDecisions({summary:d.summary,items:d.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Real LLM Call Gates", gates, "/real-llm-call-gate"],
    ["Consent Requests", consentRequests, "/real-llm-consent"],
    ["Consent Decision Simulations", decisions, "/real-llm-consent-decision"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-llm-consent-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Real LLM Consent Dashboard</h1><p style={{lineHeight:1.6}}>Phase 20.2 fasst Real LLM Gates, Consent Requests, Consent Decision Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf ohne explizite Freigabe.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real LLM Consent Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>consentRequired=true</li><li>humanApprovalRequired=true</li><li>simulatedDecision=pending_review_only</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>Kein produktiver LLM-Aufruf ohne explizite Freigabe.</li><li>Secret Scan, Output Contract und Audit bleiben Pflicht.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
