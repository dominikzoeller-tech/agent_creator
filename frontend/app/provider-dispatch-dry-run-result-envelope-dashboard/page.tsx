"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderDispatchDryRunResultEnvelopeDashboardPage(){
  const [resultEnvelopes,setResultEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [commandEnvelopes,setCommandEnvelopes]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,p,c,a]=await Promise.all([
        fetchJson("/api/provider-dispatch-dry-run-result-envelope?limit=200"),
        fetchJson("/api/provider-dispatch-dry-run-result-envelope-policy?limit=200"),
        fetchJson("/api/provider-dispatch-dry-run-command-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setResultEnvelopes({summary:r.summary,items:r.providerDispatchDryRunResultEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setCommandEnvelopes({summary:c.summary,items:c.providerDispatchDryRunCommandEnvelopes||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Dispatch Dry-Run Result Envelopes",resultEnvelopes,"/provider-dispatch-dry-run-result-envelope"],
    ["Provider Dispatch Dry-Run Result Policy",policy,"/provider-dispatch-dry-run-result-envelope-policy"],
    ["Provider Dispatch Dry-Run Command Envelopes",commandEnvelopes,"/provider-dispatch-dry-run-command-envelope"],
    ["Governance Audit",audit,"/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-dry-run-result-envelope-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Dry-Run Result Envelope Dashboard</h1><p style={{lineHeight:1.6}}>Phase 38.2 fasst Provider Dispatch Dry-Run Result Envelopes, Policy Simulationen, Provider Dispatch Dry-Run Command Envelopes und Governance Audit zusammen. Result Envelope enthält keine Provider Response. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Dispatch Dry-Run Result Envelope Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_dispatch_dry_run_result_envelope_no_provider_call</li><li>providerDispatchDryRunResultEnvelopePrepared=true</li><li>resultEnvelopePrepared=true</li><li>resultEnvelopePersisted=true</li><li>resultEnvelopeContainsProviderResponse=false</li><li>commandEnvelopePrepared=true</li><li>commandEnvelopeExecuted=false</li><li>executionGateOpen=false</li><li>finalDispatchAllowed=false</li><li>providerDispatchPerformed=false</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>dispatchPayloadIncluded=false</li><li>commandPayloadIncluded=false</li><li>promptPayloadIncluded=false</li><li>promptIncluded=false</li><li>providerResponseIncluded=false</li><li>providerResultIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>sensitiveRequestBodyIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
