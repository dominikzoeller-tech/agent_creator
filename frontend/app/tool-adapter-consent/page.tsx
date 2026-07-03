"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Plan = { id:string; adapterName?:string; decision:string; requestedAction:string };
type Binding = { id:string; toolExecutionPlanId:string; consentRequestId:string; status:string; adapterName?:string; requestedAction?:string; consentUrl:string; requestedAt:string; toolExecutionAllowed:boolean; dryRunOnly:boolean };
export default function ToolAdapterConsentPage(){
  const [plans,setPlans]=useState<Plan[]>([]);
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const planRes=await fetch("/api/tool-adapters?limit=100", { cache:"no-store" });
      const planPayload=await planRes.json();
      if(planRes.ok){ const list=Array.isArray(planPayload.plans) ? planPayload.plans : []; setPlans(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const bindingRes=await fetch("/api/tool-adapter-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(!bindingRes.ok) throw new Error(bindingPayload?.error || "Bindings konnten nicht geladen werden.");
      setBindings(Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []);
      setSummary(bindingPayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createBinding(){
    const res=await fetch("/api/tool-adapter-consent", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ toolExecutionPlanId:selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Binding fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-consent" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)", borderColor:"#93c5fd" }}><h1 className="section-title">Tool Adapter Consent Binding</h1><p style={{ lineHeight:1.6 }}>Phase 13.1 bindet Dry-run Tool Execution Plans an Consent Requests. Auch nach Approval bleibt echte Tool-Ausführung deaktiviert.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Binding erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{plans.map((plan)=><option key={plan.id} value={plan.id}>{plan.adapterName || "unknown-adapter"} · {plan.decision} · {plan.id}</option>)}</select><button className="primary-button" type="button" onClick={createBinding} disabled={!selected}>Tool Adapter Consent Binding erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Bindings</h2>{bindings.length===0 ? <p>Noch keine Tool Adapter Consent Bindings.</p> : bindings.map((binding)=><article key={binding.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{binding.adapterName || "unknown-adapter"}</strong> <span className="chip">{binding.status}</span></div><div className="helper-text"><code>{binding.id}</code> · {binding.requestedAt}</div><p><strong>Plan:</strong> <code>{binding.toolExecutionPlanId}</code></p><p><strong>Consent Request:</strong> <code>{binding.consentRequestId}</code></p>{binding.requestedAction ? <p><strong>Action:</strong> {binding.requestedAction}</p> : null}<p><strong>Tool execution allowed:</strong> {String(binding.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(binding.dryRunOnly)}</p><a className="nav-link" href={binding.consentUrl}>Consent Request öffnen</a></article>)}</section></div></main>;
}
