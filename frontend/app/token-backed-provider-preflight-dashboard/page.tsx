"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function TokenBackedProviderPreflightDashboardPage(){
  const [preflights,setPreflights]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [activationGates,setActivationGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [p,pol,aud,act]=await Promise.all([
        fetchJson("/api/token-backed-provider-invocation-preflight?limit=200"),
        fetchJson("/api/token-backed-provider-preflight-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
        fetchJson("/api/approval-token-activation-gate?limit=200"),
      ]);
      setPreflights({summary:p.summary,items:p.tokenBackedProviderInvocationPreflights||[]});
      setPolicy({summary:pol.summary,items:pol.simulations||[]});
      setAudit({summary:aud.summary,items:aud.events||[]});
      setActivationGates({summary:act.summary,items:act.approvalTokenActivationGates||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Token-backed Provider Preflights", preflights, "/token-backed-provider-invocation-preflight"],
    ["Token-backed Provider Policy", policy, "/token-backed-provider-preflight-policy"],
    ["Approval Token Activation Gates", activationGates, "/approval-token-activation-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="token-backed-provider-preflight-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Token-Backed Provider Preflight Dashboard</h1><p style={{lineHeight:1.6}}>Phase 30.2 fasst Token-backed Provider Invocation Preflights, Policy Simulationen, Approval Token Activation Gates und Audit zusammen. Kein Provider-/Netzwerk-Aufruf, kein Prompt und keine Secret-Werte.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Token-Backed Provider Preflight Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_token_backed_provider_invocation_preflight_no_provider_call</li><li>tokenBackedPreflightPrepared=true</li><li>tokenActive=false</li><li>provider=none</li><li>modelSelected=none</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
