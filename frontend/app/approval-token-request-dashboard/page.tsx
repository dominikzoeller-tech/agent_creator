"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenRequestDashboardPage(){
  const [requests,setRequests]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [gates,setGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,p,g,a]=await Promise.all([
        fetchJson("/api/human-approval-token-request?limit=200"),
        fetchJson("/api/approval-token-request-policy?limit=200"),
        fetchJson("/api/controlled-real-provider-invocation-gate?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setRequests({summary:r.summary,items:r.approvalTokenRequests||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setGates({summary:g.summary,items:g.gates||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Requests", requests, "/human-approval-token-request"],
    ["Approval Token Policy", policy, "/approval-token-request-policy"],
    ["Real Provider Gates", gates, "/controlled-real-provider-invocation-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-request-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Approval Token Request Dashboard</h1><p style={{lineHeight:1.6}}>Phase 27.2 fasst Human Approval Token Requests, Approval Token Request Policy Simulationen, Real Provider Gates und Audit zusammen. Approval Token wird nicht automatisch erteilt und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Request Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_request_no_provider_call</li><li>approvalTokenRequested=true</li><li>approvalTokenIssued=false</li><li>humanApproved=false</li><li>humanApprovalRequired=true</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
