"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenIssuanceDashboardPage(){
  const [issuanceGates,setIssuanceGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [requests,setRequests]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,r,a]=await Promise.all([
        fetchJson("/api/approval-token-issuance-gate?limit=200"),
        fetchJson("/api/approval-token-issuance-policy?limit=200"),
        fetchJson("/api/human-approval-token-request?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setIssuanceGates({summary:g.summary,items:g.approvalTokenIssuanceGates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setRequests({summary:r.summary,items:r.approvalTokenRequests||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Issuance Gates", issuanceGates, "/approval-token-issuance-gate"],
    ["Approval Token Issuance Policy", policy, "/approval-token-issuance-policy"],
    ["Approval Token Requests", requests, "/human-approval-token-request"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-issuance-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Approval Token Issuance Dashboard</h1><p style={{lineHeight:1.6}}>Phase 28.2 fasst Approval Token Issuance Gates, Issuance Policy Simulationen, Human Approval Token Requests und Audit zusammen. Token wird nicht ausgestellt und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Issuance Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_issuance_gate_no_provider_call</li><li>approvalTokenIssuancePrepared=true</li><li>approvalTokenIssued=false</li><li>humanApproved=false</li><li>issuanceIntentRecorded=true</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
