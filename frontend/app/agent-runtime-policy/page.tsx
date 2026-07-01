"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Resume = { id:string; agentName?:string; decision:string; consentStatus?:string };
type Simulation = { id:string; timestamp:string; decision:string; resumeEnvelopeId?:string; agentName?:string; requestedAction?:string; reason:string; toolExecutionAllowed:boolean; dryRunOnly:boolean; policyChecks?: Array<{ name:string; passed:boolean; reason:string }> };
export default function AgentRuntimePolicyPage(){
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [simulations,setSimulations]=useState<Simulation[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const resumeRes=await fetch("/api/agent-runtime-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(resumeRes.ok){ const list = Array.isArray(resumePayload.envelopes) ? resumePayload.envelopes : []; setResumes(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const simRes=await fetch("/api/agent-runtime-policy?limit=100", { cache:"no-store" });
      const simPayload=await simRes.json();
      if(!simRes.ok) throw new Error(simPayload?.error || "Policy Simulations konnten nicht geladen werden.");
      setSimulations(Array.isArray(simPayload.simulations) ? simPayload.simulations : []);
      setSummary(simPayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function simulate(){
    const res=await fetch("/api/agent-runtime-policy", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resumeEnvelopeId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Simulation fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-policy" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)", borderColor:"#f9a8d4" }}><h1 className="section-title">Runtime Policy Simulation</h1><p style={{ lineHeight:1.6 }}>Phase 12.3 simuliert Runtime Policy Checks und schreibt Audit Events. Es findet keine echte Tool-Ausführung statt.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Simulation erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{resumes.map((resume)=><option key={resume.id} value={resume.id}>{resume.agentName || "unknown-agent"} · {resume.decision} · {resume.consentStatus || "no-consent"} · {resume.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Runtime Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{simulations.length===0 ? <p>Noch keine Runtime Policy Simulations.</p> : simulations.map((sim)=><article key={sim.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{sim.agentName || "unknown-agent"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div>{sim.requestedAction ? <p><strong>Action:</strong> {sim.requestedAction}</p> : null}<p><strong>Reason:</strong> {sim.reason}</p><p><strong>Tool execution allowed:</strong> {String(sim.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(sim.dryRunOnly)}</p>{sim.policyChecks?.length ? <ul>{sim.policyChecks.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul> : null}</article>)}</section></div></main>;
}
