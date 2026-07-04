"use client";
import { useEffect, useMemo, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type State = { count:number; summary:any; ok:boolean; error?:string };
type GuidedStep = { id:string; title:string; description:string; href:string; status:"ready"|"needs-input"|"review"|"done"; primary:boolean };
async function getJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error || url); return payload; }
function statusLabel(status: GuidedStep["status"]){ if(status==="ready") return "Ready"; if(status==="needs-input") return "Needs Input"; if(status==="review") return "Review"; return "Done"; }
export default function MasterAgentCockpitPage(){
  const [governance,setGovernance]=useState<State>({count:0,summary:null,ok:false});
  const [runtime,setRuntime]=useState<State>({count:0,summary:null,ok:false});
  const [tools,setTools]=useState<State>({count:0,summary:null,ok:false});
  const [audit,setAudit]=useState<State>({count:0,summary:null,ok:false});
  const [capabilityCount,setCapabilityCount]=useState(0);
  const [blueprintCount,setBlueprintCount]=useState(0);
  const [error,setError]=useState<string|null>(null);
  const [actionMessage,setActionMessage]=useState<string|null>(null);
  async function createActionPlan(actionType:string){
    setActionMessage(null);
    try{
      const res=await fetch("/api/cockpit-actions", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ actionType }) });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Cockpit Action fehlgeschlagen");
      setActionMessage("Cockpit Action geplant: " + payload.plan.title);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  async function load(){
    setError(null);
    try{
      const [agentRegistry, runtimeDash, toolAdapters, auditPayload, capabilities, blueprints] = await Promise.all([
        getJson("/api/agent-registry"),
        getJson("/api/agent-runtime?limit=100"),
        getJson("/api/tool-adapters?limit=100"),
        getJson("/api/governance-audit?limit=100"),
        getJson("/api/capability-requests"),
        getJson("/api/agent-blueprints"),
      ]);
      const entries = Array.isArray(agentRegistry.entries) ? agentRegistry.entries : [];
      setGovernance({ ok:true, count:entries.length, summary:agentRegistry.counts || {} });
      setRuntime({ ok:true, count:Array.isArray(runtimeDash.envelopes)?runtimeDash.envelopes.length:0, summary:runtimeDash.summary || {} });
      setTools({ ok:true, count:Array.isArray(toolAdapters.adapters)?toolAdapters.adapters.length:0, summary:{ adapters: toolAdapters.adapterSummary || {}, plans: toolAdapters.planSummary || {} } });
      setAudit({ ok:true, count:Array.isArray(auditPayload.events)?auditPayload.events.length:0, summary:auditPayload.summary || {} });
      setCapabilityCount(Array.isArray(capabilities.requests)?capabilities.requests.length:0);
      setBlueprintCount(Array.isArray(blueprints.proposals)?blueprints.proposals.length:0);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const guidedSteps: GuidedStep[] = useMemo(()=>[
    { id:"capabilities", title:"1. Fehlende Fähigkeiten prüfen", description:"Capability Requests zeigen, welche Fähigkeiten der Master Agent vorbereiten soll.", href:"/capability-requests", status:capabilityCount>0?"review":"ready", primary:true },
    { id:"blueprints", title:"2. Agent Blueprints bewerten", description:"Blueprints bleiben Vorschläge, bis Registrierung und Kontrolle klar sind.", href:"/agent-blueprints", status:blueprintCount>0?"review":"needs-input", primary:true },
    { id:"registry", title:"3. Agent Registry kontrollieren", description:"Nur registrierte/test-mode Agents kommen in Runtime Dry-runs.", href:"/agent-registry", status:governance.count>0?"review":"needs-input", primary:true },
    { id:"runtime", title:"4. Runtime Dry-run prüfen", description:"Agent Runtime bleibt Dry-run-only mit Consent, Resume und Policy.", href:"/agent-runtime-dashboard", status:runtime.count>0?"review":"ready", primary:true },
    { id:"tools", title:"5. Tool Adapter vorbereiten", description:"Tool Adapter erzeugen nur Dry-run Plans, keine echte Tool-Ausführung.", href:"/tool-adapter-dashboard", status:tools.count>0?"review":"ready", primary:true },
    { id:"audit", title:"6. Audit Trail prüfen", description:"Audit zeigt, welche Entscheidungen und Simulationen entstanden sind.", href:"/governance-audit", status:audit.count>0?"review":"ready", primary:false },
  ],[capabilityCount, blueprintCount, governance.count, runtime.count, tools.count, audit.count]);
  const nextPrimary = guidedSteps.find((step)=>step.primary && step.status!=="done") || guidedSteps[0];
  const sections = [
    { title:"Governance", text:"Consent, Capability Requests, Agent Blueprints und Agent Registry.", href:"/agent-registry", state:governance, next:"Agent Registry prüfen" },
    { title:"Controlled Agent Runtime", text:"Dry-run Runtime Envelopes, Consent Binding, Resume und Policy Simulation.", href:"/agent-runtime-dashboard", state:runtime, next:"Runtime Dashboard öffnen" },
    { title:"Tool Adapter Sandbox", text:"Tool Adapter Registry, Dry-run Plans, Consent Binding, Resume und Policy Simulation.", href:"/tool-adapter-dashboard", state:tools, next:"Tool Dashboard öffnen" },
    { title:"Audit Trail", text:"Governance Audit Events und nachvollziehbare Entscheidungen.", href:"/governance-audit", state:audit, next:"Audit öffnen" },
  ];
  return <main className="page-wrap"><UnifiedNavigation active="master-cockpit" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Master Agent Cockpit</h1><p style={{ lineHeight:1.6 }}>Cockpit Actions / Orchestration Prep: Das Cockpit zeigt den nächsten sinnvollen Schritt, statt alle technischen Konsolen gleichrangig bedienen zu müssen.</p><div style={{ display:"flex", gap:10, flexWrap:"wrap" }}><a className="primary-button" href={nextPrimary.href}>Weiter: {nextPrimary.title}</a><button className="secondary-button" type="button" onClick={load}>Cockpit aktualisieren</button></div></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}{actionMessage ? <section className="panel-card" style={{ borderColor:"#bbf7d0", background:"#f0fdf4" }}>{actionMessage}</section> : null}<section className="panel-card"><h2>Guided Next Actions</h2><div className="phase14-guided-flow">{guidedSteps.map((step)=><div key={step.id} className={step.id===nextPrimary.id?"phase14-guided-step active":"phase14-guided-step"}><a href={step.href} style={{ color:"inherit", textDecoration:"none", flex:1 }}><strong>{step.title}</strong><p>{step.description}</p></a><div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}><span className="chip">{statusLabel(step.status)}</span><button className="secondary-button" type="button" onClick={()=>createActionPlan(step.id=== "capabilities" ? "review_capabilities" : step.id === "blueprints" ? "prepare_agent_blueprint" : step.id === "registry" ? "review_agent_registry" : step.id === "runtime" ? "prepare_runtime_dry_run" : step.id === "tools" ? "prepare_tool_adapter_plan" : "review_audit")}>Planen</button></div></div>)}</div></section><section className="panel-card"><h2>Unified Control Center</h2><div className="metrics-grid">{sections.map((item)=><a className="metric-card" href={item.href} key={item.title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{item.title}</span><strong className="metric-value">{item.state.count}</strong><p>{item.text}</p><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(item.state.summary ?? {}, null, 2)}</pre><span className="nav-link">{item.next}</span></a>)}</div></section><section className="panel-card"><h2>LLM Routing</h2><p>Kontrollierte LLM Routing Envelopes und Policy Simulationen.</p><a className="secondary-button" href="/llm-routing-dashboard">LLM Dashboard</a></section><section className="panel-card"><h2>LLM Stub</h2><p>Dry-run Explainer Responses und Stub Policy Simulationen.</p><a className="secondary-button" href="/llm-stub-dashboard">Stub Dashboard</a></section><section className="panel-card"><h2>Real LLM Gate</h2><p>Policy-gated Real LLM Invocation Prep ohne produktiven LLM-Aufruf.</p><a className="secondary-button" href="/real-llm-gate-dashboard">Real LLM Gate Dashboard</a></section><section className="panel-card"><h2>Real LLM Consent</h2><p>Human Approval Gate für spätere echte LLM-Aufrufe.</p><a className="secondary-button" href="/real-llm-consent-dashboard">Consent Dashboard</a></section><section className="panel-card"><h2>Invocation Envelope</h2><p>Approved Real LLM Invocation Envelope Prep ohne produktiven LLM-Aufruf.</p><a className="secondary-button" href="/approved-real-llm-invocation-envelope-dashboard">Envelope Dashboard</a></section><section className="panel-card"><h2>Provider Adapter Stub</h2><p>Provider-agnostic no-network LLM Adapter Prep.</p><a className="secondary-button" href="/provider-llm-adapter-dashboard">Provider Adapter Dashboard</a></section><section className="panel-card"><h2>Provider Config</h2><p>Secret Boundary und Provider Config Presence Checks ohne Secret Exposure.</p><a className="secondary-button" href="/provider-config-dashboard">Provider Config Dashboard</a></section><section className="panel-card"><h2>Provider Readiness</h2><p>Readiness Preflight und Policy ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-readiness-dashboard">Provider Readiness Dashboard</a></section><section className="panel-card"><h2>Provider Simulation</h2><p>Controlled Provider Invocation Simulation ohne externe Calls.</p><a className="secondary-button" href="/provider-simulation-dashboard">Provider Simulation Dashboard</a></section><section className="panel-card"><h2>Real Provider Gate</h2><p>Gate und Policy für echte Provider Invocation mit Human Approval Required.</p><a className="secondary-button" href="/real-provider-gate-dashboard">Real Provider Gate Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>Keine echte Tool-Ausführung.</strong></li><li><strong>toolExecutionAllowed</strong> bleibt false.</li><li><strong>dryRunOnly</strong> bleibt true.</li><li><strong>Consent Approval</strong> ist noch keine automatische Ausführung.</li><li><strong>Guided Flow</strong> führt durch sichere Vorbereitungsschritte.</li></ul></section></div></main>;
}
