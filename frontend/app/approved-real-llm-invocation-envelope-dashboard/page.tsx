"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function InvocationEnvelopeDashboardPage(){
  const [consentRequests,setConsentRequests]=useState<ApiState>({});
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [c,e,p,a]=await Promise.all([
        fetchJson("/api/real-llm-consent?limit=200"),
        fetchJson("/api/approved-real-llm-invocation-envelope?limit=200"),
        fetchJson("/api/approved-real-llm-invocation-envelope-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setConsentRequests({summary:c.summary,items:c.consentRequests||[]});
      setEnvelopes({summary:e.summary,items:e.invocationEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Consent Requests", consentRequests, "/real-llm-consent"],
    ["Invocation Envelopes", envelopes, "/approved-real-llm-invocation-envelope"],
    ["Envelope Policy Simulations", policy, "/approved-real-llm-invocation-envelope-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approved-real-llm-invocation-envelope-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Invocation Envelope Dashboard</h1><p style={{lineHeight:1.6}}>Phase 21.2 fasst Consent Requests, Approved Invocation Envelopes, Envelope Policy Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf und keine Tool-/Agent-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Invocation Envelope Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>approved_invocation_envelope_prep_only</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>consentRequired=true</li><li>humanApprovalRequired=true</li><li>Output Contract locked</li><li>finaler Secret Scan</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine Tool-Ausführung.</li><li>Keine Agent-Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
