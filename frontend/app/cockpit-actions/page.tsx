"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ActionPlan = { id:string; timestamp:string; actionType:string; title:string; targetHref:string; status:string; executionAllowed:boolean; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function CockpitActionsPage(){
  const [plans,setPlans]=useState<ActionPlan[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/cockpit-actions?limit=200", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Cockpit Actions konnten nicht geladen werden.");
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  return <main className="page-wrap"><UnifiedNavigation active="cockpit-actions" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#f0fdf4 100%)", borderColor:"#86efac" }}><h1 className="section-title">Cockpit Action History</h1><p style={{ lineHeight:1.6 }}>Phase 14.4 zeigt geplante Cockpit Actions als Historie. Diese Pläne bereiten Master-Agent-Orchestrierung vor, führen aber nichts aus.</p><button className="secondary-button" type="button" onClick={load}>Historie aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Action Plans</h2>{plans.length===0 ? <p>Noch keine Cockpit Action Plans. Im Master Cockpit bei Guided Next Actions auf „Planen“ klicken.</p> : plans.map((plan)=><article key={plan.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{plan.title}</strong> <span className="chip">{plan.actionType}</span> <span className="chip">{plan.status}</span></div><div className="helper-text"><code>{plan.id}</code> · {plan.timestamp}</div><p><strong>Reason:</strong> {plan.reason}</p><p><strong>Execution allowed:</strong> {String(plan.executionAllowed)} · <strong>Tool execution allowed:</strong> {String(plan.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(plan.dryRunOnly)}</p><a className="nav-link" href={plan.targetHref}>Ziel öffnen</a></article>)}</section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>Action Plans sind Orchestrierungs-Vorbereitung, keine Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
