"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenActivationDashboardPage(){
  const [activationGates,setActivationGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [issuanceGates,setIssuanceGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,i,a]=await Promise.all([
        fetchJson("/api/approval-token-activation-gate?limit=200"),
        fetchJson("/api/approval-token-activation-policy?limit=200"),
        fetchJson("/api/approval-token-issuance-gate?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setActivationGates({summary:g.summary,items:g.approvalTokenActivationGates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setIssuanceGates({summary:i.summary,items:i.approvalTokenIssuanceGates||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Activation Gates", activationGates, "/approval-token-activation-gate"],
    ["Approval Token Activation Policy", policy, "/approval-token-activation-policy"],
    ["Approval Token Issuance Gates", issuanceGates, "/approval-token-issuance-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-activation-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)",borderColor:"#7dd3fc"}}><h1 className="section-title">Approval Token Activation Dashboard</h1><p style={{lineHeight:1.6}}>Phase 29.2 fasst Approval Token Activation Gates, Activation Policy Simulationen, Issuance Gates und Audit zusammen. Token bleibt nicht aktiv und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Activation Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_activation_gate_no_provider_call</li><li>tokenActivationPrepared=true</li><li>tokenActive=false</li><li>activationIntentRecorded=true/false</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
