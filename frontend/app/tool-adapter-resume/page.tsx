"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding = { id:string; toolExecutionPlanId:string; consentRequestId:string; status:string; adapterName?:string };
type Resume = { id:string; timestamp:string; toolExecutionPlanId:string; decision:string; adapterName?:string; requestedAction?:string; consentStatus?:string; resumeAllowed:boolean; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function ToolAdapterResumePage(){
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const bindingRes=await fetch("/api/tool-adapter-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(bindingRes.ok){ const list=Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []; setBindings(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const resumeRes=await fetch("/api/tool-adapter-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(!resumeRes.ok) throw new Error(resumePayload?.error || "Resume Plans konnten nicht geladen werden.");
      setResumes(Array.isArray(resumePayload.plans) ? resumePayload.plans : []);
      setSummary(resumePayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createResume(){
    const res=await fetch("/api/tool-adapter-resume", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ consentBindingId:selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Resume fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-resume" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)", borderColor:"#fdba74" }}><h1 className="section-title">Approved Tool Adapter Resume Plan</h1><p style={{ lineHeight:1.6 }}>Phase 13.2 erstellt Resume Plans für approved Tool Adapter Consent Bindings. Es bleibt Dry-run-only und ohne echte Tool-Ausführung.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Resume Plan erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{bindings.map((binding)=><option key={binding.id} value={binding.id}>{binding.adapterName || "unknown-adapter"} · {binding.status} · {binding.id}</option>)}</select><button className="primary-button" type="button" onClick={createResume} disabled={!selected}>Approved Tool Adapter Resume Plan erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Resume Plans</h2>{resumes.length===0 ? <p>Noch keine Tool Adapter Resume Plans.</p> : resumes.map((resume)=><article key={resume.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{resume.adapterName || "unknown-adapter"}</strong> <span className="chip">{resume.decision}</span> {resume.consentStatus ? <span className="chip">{resume.consentStatus}</span> : null}</div><div className="helper-text"><code>{resume.id}</code> · {resume.timestamp}</div><p><strong>Plan:</strong> <code>{resume.toolExecutionPlanId}</code></p>{resume.requestedAction ? <p><strong>Action:</strong> {resume.requestedAction}</p> : null}<p><strong>Resume allowed:</strong> {String(resume.resumeAllowed)} · <strong>Tool execution allowed:</strong> {String(resume.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(resume.dryRunOnly)}</p><p><strong>Reason:</strong> {resume.reason}</p></article>)}</section></div></main>;
}
