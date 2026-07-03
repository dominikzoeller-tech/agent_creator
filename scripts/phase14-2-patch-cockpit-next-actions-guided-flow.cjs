const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase14:2:patch"]="node scripts/phase14-2-patch-cockpit-next-actions-guided-flow.cjs";
  pkg.scripts["phase14:2:verify"]="node scripts/phase14-2-verify-cockpit-next-actions-guided-flow.cjs";
  pkg.scripts["cockpit:guided:verify"]="node scripts/phase14-2-verify-cockpit-next-actions-guided-flow.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 14.2 Scripts eingetragen.");
}
const cockpitPage = String.raw`"use client";
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
  return <main className="page-wrap"><UnifiedNavigation active="master-cockpit" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Master Agent Cockpit</h1><p style={{ lineHeight:1.6 }}>Guided Flow: Das Cockpit zeigt den nächsten sinnvollen Schritt, statt alle technischen Konsolen gleichrangig bedienen zu müssen.</p><div style={{ display:"flex", gap:10, flexWrap:"wrap" }}><a className="primary-button" href={nextPrimary.href}>Weiter: {nextPrimary.title}</a><button className="secondary-button" type="button" onClick={load}>Cockpit aktualisieren</button></div></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Guided Next Actions</h2><div className="phase14-guided-flow">{guidedSteps.map((step)=><a key={step.id} href={step.href} className={step.id===nextPrimary.id?"phase14-guided-step active":"phase14-guided-step"}><div><strong>{step.title}</strong><p>{step.description}</p></div><span className="chip">{statusLabel(step.status)}</span></a>)}</div></section><section className="panel-card"><h2>Unified Control Center</h2><div className="metrics-grid">{sections.map((item)=><a className="metric-card" href={item.href} key={item.title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{item.title}</span><strong className="metric-value">{item.state.count}</strong><p>{item.text}</p><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(item.state.summary ?? {}, null, 2)}</pre><span className="nav-link">{item.next}</span></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>Keine echte Tool-Ausführung.</strong></li><li><strong>toolExecutionAllowed</strong> bleibt false.</li><li><strong>dryRunOnly</strong> bleibt true.</li><li><strong>Consent Approval</strong> ist noch keine automatische Ausführung.</li><li><strong>Guided Flow</strong> führt durch sichere Vorbereitungsschritte.</li></ul></section></div></main>;
}
`;
const cssAppend = String.raw`

/* Phase 14.2 – Cockpit Next Actions / Guided Flow */
.phase14-guided-flow {
  display: grid;
  gap: 10px;
}
.phase14-guided-step {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 14px;
  color: inherit;
  text-decoration: none;
}
.phase14-guided-step:hover,
.phase14-guided-step.active {
  border-color: #2563eb;
  background: #eff6ff;
}
.phase14-guided-step p {
  margin: 6px 0 0;
  color: #475569;
  line-height: 1.5;
}
`;
function patchCss(){
  const file="frontend/app/globals.css";
  if(!exists(file)) return console.log("SKIP globals.css fehlt.");
  let content=read(file);
  if(!content.includes("Phase 14.2 – Cockpit Next Actions")){
    content += cssAppend;
    write(file, content);
    console.log("OK globals.css: Phase 14.2 CSS ergänzt.");
  } else console.log("SKIP globals.css: Phase 14.2 CSS bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase14-2-cockpit-next-actions-guided-flow.md", `# Phase 14.2 – Cockpit Next Actions / Guided Flow

## Ziel
Das Master Agent Cockpit bekommt einen geführten Next-Actions-Flow. Der Nutzer soll nicht mehr technische Einzelseiten suchen müssen, sondern den nächsten sinnvollen Schritt sehen.

## Ergänzt
- Guided Next Actions im /master-cockpit
- Primärer Weiter-Button
- Status Labels: Ready, Needs Input, Review, Done
- Fokus auf Capability Requests, Blueprints, Agent Registry, Runtime, Tool Adapter und Audit

## Sicherheitsprinzip
Keine neue Execution-Logik. Weiterhin keine echte Tool-Ausführung. toolExecutionAllowed=false und dryRunOnly=true bleiben zentrale Invarianten.

## Nächster Schritt
Phase 14.3 kann den Guided Flow an echte Cockpit Actions / Master-Agent-Orchestrierung anbinden.
`);
  ensureFile("docs/phase14-cockpit-next-actions-guided-flow-runbook.md", `# Runbook – Phase 14.2 Cockpit Next Actions / Guided Flow

## Patch
\`\`\`powershell
npm run phase14:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase14-2-patch-cockpit-next-actions-guided-flow.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase14:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Schneller Check ohne Docker-Neustart
\`\`\`powershell
npm run phase14:2:verify
npm run build
\`\`\`

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Guided Next Actions prüfen.
3. Weiter-Button prüfen.
4. Safety Invariants prüfen.
`);
}
patchPackage();
write("frontend/app/master-cockpit/page.tsx", cockpitPage);
patchCss();
patchDocs();
console.log("Phase 14.2 Patch abgeschlossen.");
