"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type State = { count:number; summary:any; ok:boolean; error?:string };
async function getJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error || url); return payload; }
export default function MasterAgentCockpitPage(){
  const [governance,setGovernance]=useState<State>({count:0,summary:null,ok:false});
  const [runtime,setRuntime]=useState<State>({count:0,summary:null,ok:false});
  const [tools,setTools]=useState<State>({count:0,summary:null,ok:false});
  const [audit,setAudit]=useState<State>({count:0,summary:null,ok:false});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [agentRegistry, runtimeDash, toolAdapters, auditPayload] = await Promise.all([
        getJson("/api/agent-registry"),
        getJson("/api/agent-runtime?limit=100"),
        getJson("/api/tool-adapters?limit=100"),
        getJson("/api/governance-audit?limit=100"),
      ]);
      setGovernance({ ok:true, count:Array.isArray(agentRegistry.entries)?agentRegistry.entries.length:0, summary:agentRegistry.counts || {} });
      setRuntime({ ok:true, count:Array.isArray(runtimeDash.envelopes)?runtimeDash.envelopes.length:0, summary:runtimeDash.summary || {} });
      setTools({ ok:true, count:Array.isArray(toolAdapters.adapters)?toolAdapters.adapters.length:0, summary:{ adapters: toolAdapters.adapterSummary || {}, plans: toolAdapters.planSummary || {} } });
      setAudit({ ok:true, count:Array.isArray(auditPayload.events)?auditPayload.events.length:0, summary:auditPayload.summary || {} });
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const sections = [
    { title:"Governance", text:"Consent, Capability Requests, Agent Blueprints und Agent Registry.", href:"/agent-registry", state:governance, next:"Agent Registry prüfen" },
    { title:"Controlled Agent Runtime", text:"Dry-run Runtime Envelopes, Consent Binding, Resume und Policy Simulation.", href:"/agent-runtime-dashboard", state:runtime, next:"Runtime Dashboard öffnen" },
    { title:"Tool Adapter Sandbox", text:"Tool Adapter Registry, Dry-run Plans, Consent Binding, Resume und Policy Simulation.", href:"/tool-adapter-dashboard", state:tools, next:"Tool Dashboard öffnen" },
    { title:"Audit Trail", text:"Governance Audit Events und nachvollziehbare Entscheidungen.", href:"/governance-audit", state:audit, next:"Audit öffnen" },
  ];
  return <main className="page-wrap"><UnifiedNavigation active="master-cockpit" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Master Agent Cockpit</h1><p style={{ lineHeight:1.6 }}>Phase 14.0 konsolidiert Governance, Runtime und Tool Adapter in ein zentrales Cockpit. Die technischen Einzelseiten bleiben erreichbar, werden aber als Admin-/Developer-Konsolen gruppiert.</p><button className="secondary-button" type="button" onClick={load}>Cockpit aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Unified Control Center</h2><div className="metrics-grid">{sections.map((item)=><a className="metric-card" href={item.href} key={item.title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{item.title}</span><strong className="metric-value">{item.state.count}</strong><p>{item.text}</p><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(item.state.summary ?? {}, null, 2)}</pre><span className="nav-link">{item.next}</span></a>)}</div></section><section className="panel-card"><h2>Next Actions</h2><div className="phase11-card-grid"><a className="metric-card" href="/capability-requests"><strong>1. Fehlende Fähigkeiten prüfen</strong><p>Capability Requests und Agent Blueprints als vorbereitende Schritte.</p></a><a className="metric-card" href="/agent-runtime-dashboard"><strong>2. Agent Runtime dry-run prüfen</strong><p>Keine echte Ausführung — nur Envelopes, Consent, Resume, Policy.</p></a><a className="metric-card" href="/tool-adapter-dashboard"><strong>3. Tool Adapter dry-run prüfen</strong><p>Keine echte Tool-Ausführung — nur Plans, Consent, Resume, Policy.</p></a><a className="metric-card" href="/governance-audit"><strong>4. Audit Trail prüfen</strong><p>Entscheidungen und Simulationen nachvollziehen.</p></a></div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>Keine echte Tool-Ausführung.</strong></li><li><strong>toolExecutionAllowed</strong> bleibt false.</li><li><strong>dryRunOnly</strong> bleibt true.</li><li><strong>Consent Approval</strong> ist noch keine automatische Ausführung.</li><li><strong>Master Agent</strong> orchestriert später diese Schritte, statt alle Debug-Seiten manuell bedienen zu müssen.</li></ul></section></div></main>;
}
