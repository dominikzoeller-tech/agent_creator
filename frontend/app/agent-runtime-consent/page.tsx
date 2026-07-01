"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding = { id:string; runtimeEnvelopeId:string; consentRequestId:string; status:string; agentName?:string; requestedAction?:string; consentUrl:string; requestedAt:string };
type Envelope = { id:string; agentName?:string; requestedAction:string; decision:string; timestamp:string };
export default function AgentRuntimeConsentPage(){
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [envelopes,setEnvelopes]=useState<Envelope[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const bindingRes=await fetch("/api/agent-runtime-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(!bindingRes.ok) throw new Error(bindingPayload?.error || "Bindings konnten nicht geladen werden.");
      setBindings(Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []);
      setSummary(bindingPayload.summary || null);
      const runtimeRes=await fetch("/api/agent-runtime?limit=100", { cache:"no-store" });
      const runtimePayload=await runtimeRes.json();
      if(runtimeRes.ok){ const list = Array.isArray(runtimePayload.envelopes) ? runtimePayload.envelopes : []; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createBinding(){
    const res=await fetch("/api/agent-runtime-consent", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ runtimeEnvelopeId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Binding fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-consent" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)", borderColor:"#86efac" }}><h1 className="section-title">Runtime Consent Binding</h1><p style={{ lineHeight:1.6 }}>Phase 12.1 bindet Runtime Envelopes an Consent Requests. Auch nach Approval bleibt echte Tool-Ausführung weiterhin deaktiviert.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Binding erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.agentName || "unknown-agent"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={createBinding} disabled={!selected}>Runtime Consent Binding erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Bindings</h2>{bindings.length===0 ? <p>Noch keine Runtime Consent Bindings.</p> : bindings.map((binding)=><article key={binding.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{binding.agentName || "unknown-agent"}</strong> <span className="chip">{binding.status}</span></div><div className="helper-text"><code>{binding.id}</code> · {binding.requestedAt}</div><p><strong>Envelope:</strong> <code>{binding.runtimeEnvelopeId}</code></p><p><strong>Consent Request:</strong> <code>{binding.consentRequestId}</code></p>{binding.requestedAction ? <p><strong>Action:</strong> {binding.requestedAction}</p> : null}<a className="nav-link" href={binding.consentUrl}>Consent Request öffnen</a></article>)}</section></div></main>;
}
