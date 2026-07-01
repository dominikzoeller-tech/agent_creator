"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Envelope = { id:string; timestamp:string; mode:string; decision:string; agentId?:string; agentName?:string; requestedAction:string; status?:string; reason:string; toolExecutionAllowed:boolean; dryRunOnly:boolean; missingPermissions?:string[] };
export default function AgentRuntimePage(){
  const [envelopes,setEnvelopes]=useState<Envelope[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  const [agentName,setAgentName]=useState("CustomCapabilityAgent");
  const [requestedAction,setRequestedAction]=useState("dry-run analyze requested capability");
  const [permissions,setPermissions]=useState("read_context");
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/agent-runtime?limit=100", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Runtime konnte nicht geladen werden.");
      setEnvelopes(Array.isArray(payload.envelopes) ? payload.envelopes : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createEnvelope(){
    const requiredPermissions = permissions.split(",").map((item)=>item.trim()).filter(Boolean);
    const res=await fetch("/api/agent-runtime", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ agentName, requestedAction, requiredPermissions, mode:"dry_run" }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Envelope fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Controlled Agent Runtime Foundation</h1><p style={{ lineHeight:1.6 }}>Phase 12.0 erzeugt nur Dry-run Runtime Envelopes. Es wird kein Tool ausgeführt und kein Agent frei gestartet.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Dry-run Envelope erstellen</h2><input className="text-input" value={agentName} onChange={(e)=>setAgentName(e.target.value)} /><input className="text-input" value={requestedAction} onChange={(e)=>setRequestedAction(e.target.value)} /><input className="text-input" value={permissions} onChange={(e)=>setPermissions(e.target.value)} /><button className="primary-button" type="button" onClick={createEnvelope}>Dry-run Envelope erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Runtime Envelopes</h2>{envelopes.length===0 ? <p>Noch keine Runtime Envelopes.</p> : envelopes.map((env)=><article key={env.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{env.agentName || env.agentId || "unknown-agent"}</strong> <span className="chip">{env.decision}</span> <span className="chip">{env.mode}</span></div><div className="helper-text"><code>{env.id}</code> · {env.timestamp}</div><p><strong>Action:</strong> {env.requestedAction}</p><p><strong>Reason:</strong> {env.reason}</p><p><strong>Tool execution allowed:</strong> {String(env.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(env.dryRunOnly)}</p>{env.missingPermissions?.length ? <p><strong>Missing permissions:</strong> {env.missingPermissions.join(", ")}</p> : null}</article>)}</section></div></main>;
}
