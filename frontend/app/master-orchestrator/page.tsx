"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ActionPlan={ id:string; title:string; actionType:string; timestamp:string };
type OrchPlan={ id:string; timestamp:string; title:string; decision:string; actionType?:string; reason:string; executionAllowed:boolean; toolExecutionAllowed:boolean; agentExecutionAllowed:boolean; dryRunOnly:boolean; orchestrationSteps:Array<{id:string;title:string;targetHref?:string;safetyGate:string}> };
export default function MasterOrchestratorPage(){
  const [actions,setActions]=useState<ActionPlan[]>([]);
  const [plans,setPlans]=useState<OrchPlan[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [actionsRes, plansRes]=await Promise.all([fetch("/api/cockpit-actions?limit=100",{cache:"no-store"}), fetch("/api/master-orchestrator?limit=100",{cache:"no-store"})]);
      const actionsPayload=await actionsRes.json(); const plansPayload=await plansRes.json();
      if(actionsRes.ok){ const list=Array.isArray(actionsPayload.plans)?actionsPayload.plans:[]; setActions(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      if(!plansRes.ok) throw new Error(plansPayload?.error || "Orchestrator Plans konnten nicht geladen werden.");
      setPlans(Array.isArray(plansPayload.plans)?plansPayload.plans:[]); setSummary(plansPayload.summary||null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createPlan(){
    const res=await fetch("/api/master-orchestrator",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ actionPlanId:selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Plan fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="master-orchestrator" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Master Agent Orchestrator</h1><p style={{ lineHeight:1.6 }}>Phase 15.0 liest Cockpit Action Plans und erzeugt sichere Orchestration Plans. Keine echte Tool- oder Agent-Ausführung.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Orchestration Plan erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{actions.map((action)=><option key={action.id} value={action.id}>{action.title} · {action.actionType} · {action.id}</option>)}</select><button className="primary-button" type="button" onClick={createPlan} disabled={!selected}>Orchestration Plan erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Orchestration Plans</h2>{plans.length===0 ? <p>Noch keine Orchestration Plans.</p> : plans.map((plan)=><article key={plan.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{plan.title}</strong> <span className="chip">{plan.decision}</span></div><div className="helper-text"><code>{plan.id}</code> · {plan.timestamp}</div><p><strong>Reason:</strong> {plan.reason}</p><p><strong>Execution:</strong> {String(plan.executionAllowed)} · <strong>Tool:</strong> {String(plan.toolExecutionAllowed)} · <strong>Agent:</strong> {String(plan.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(plan.dryRunOnly)}</p><ul>{plan.orchestrationSteps?.map((step)=><li key={step.id}><strong>{step.title}</strong> – {step.safetyGate} {step.targetHref ? <a className="nav-link" href={step.targetHref}>öffnen</a> : null}</li>)}</ul></article>)}</section></div></main>;
}
