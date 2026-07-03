"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Adapter = { id:string; status:string; adapterName:string; displayName:string; purpose:string; allowedInputKeys:string[]; allowedOutputKeys:string[]; requiredPermissions:string[]; riskLevel:string; requiresConsent:boolean };
type Plan = { id:string; timestamp:string; adapterName?:string; decision:string; requestedAction:string; rejectedInputKeys:string[]; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function ToolSandboxPage(){
  const [adapters,setAdapters]=useState<Adapter[]>([]);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [adapterSummary,setAdapterSummary]=useState<any>(null);
  const [planSummary,setPlanSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [name,setName]=useState("sample-report-adapter");
  const [purpose,setPurpose]=useState("Dry-run report adapter for controlled sandbox planning.");
  const [inputJson,setInputJson]=useState('{"query":"demo","format":"summary"}');
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/tool-adapters?limit=100", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Tool Adapter konnten nicht geladen werden.");
      setAdapters(Array.isArray(payload.adapters) ? payload.adapters : []);
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setAdapterSummary(payload.adapterSummary || null);
      setPlanSummary(payload.planSummary || null);
      if(!selected && payload.adapters?.[0]?.id) setSelected(payload.adapters[0].id);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function register(){
    const res=await fetch("/api/tool-adapters", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ adapterName:name, displayName:name, purpose, allowedInputKeys:["query","format"], allowedOutputKeys:["summary","citations"], requiredPermissions:["read_context"], riskLevel:"medium", requiresConsent:true }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Register fehlgeschlagen"); }
    await load();
  }
  async function plan(){
    let input: Record<string, unknown> = {};
    try { input = JSON.parse(inputJson); } catch { setError("Input JSON ist ungültig."); return; }
    const adapter = adapters.find((entry)=>entry.id===selected);
    const res=await fetch("/api/tool-adapters", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"plan", adapterId:selected, adapterName:adapter?.adapterName, requestedAction:"dry-run tool execution plan", input, grantedPermissions:["read_context"] }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Plan fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-sandbox" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f0fdfa 0%,#f8fafc 100%)", borderColor:"#5eead4" }}><h1 className="section-title">Controlled Tool Execution Sandbox</h1><p style={{ lineHeight:1.6 }}>Phase 13.0 registriert Tool Adapter und erzeugt Dry-run Tool Execution Plans. Es findet keine echte Tool-Ausführung statt.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Tool Adapter registrieren</h2><input className="text-input" value={name} onChange={(e)=>setName(e.target.value)} /><textarea className="text-area" value={purpose} onChange={(e)=>setPurpose(e.target.value)} /><button className="primary-button" type="button" onClick={register}>Adapter in Test Mode registrieren</button></section><section className="panel-card"><h2>Dry-run Execution Plan</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{adapters.map((adapter)=><option key={adapter.id} value={adapter.id}>{adapter.adapterName} · {adapter.status}</option>)}</select><textarea className="text-area" value={inputJson} onChange={(e)=>setInputJson(e.target.value)} /><button className="primary-button" type="button" onClick={plan} disabled={!selected}>Dry-run Plan erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify({ adapterSummary, planSummary }, null, 2)}</pre></section><section className="panel-card"><h2>Plans</h2>{plans.length===0 ? <p>Noch keine Tool Execution Plans.</p> : plans.map((item)=><article key={item.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{item.adapterName || "unknown-adapter"}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Action:</strong> {item.requestedAction}</p><p><strong>Reason:</strong> {item.reason}</p><p><strong>Tool execution allowed:</strong> {String(item.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(item.dryRunOnly)}</p>{item.rejectedInputKeys?.length ? <p><strong>Rejected input keys:</strong> {item.rejectedInputKeys.join(", ")}</p> : null}</article>)}</section></div></main>;
}
