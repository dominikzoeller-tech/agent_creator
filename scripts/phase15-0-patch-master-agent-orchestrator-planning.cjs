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
  pkg.scripts["phase15:0:patch"]="node scripts/phase15-0-patch-master-agent-orchestrator-planning.cjs";
  pkg.scripts["phase15:0:verify"]="node scripts/phase15-0-verify-master-agent-orchestrator-planning.cjs";
  pkg.scripts["orchestrator:planning:verify"]="node scripts/phase15-0-verify-master-agent-orchestrator-planning.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 15.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type OrchestrationDecision = "planned" | "blocked_missing_action" | "blocked_execution_not_safe";
export interface MasterAgentOrchestrationPlan {
  id: string;
  timestamp: string;
  sourceActionPlanId?: string;
  actionType?: string;
  title: string;
  targetHref?: string;
  decision: OrchestrationDecision;
  orchestrationSteps: Array<{ id: string; title: string; targetHref?: string; safetyGate: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function actionPlansPath(): string { return path.join(dataDir(), "cockpit-action-plans.jsonl"); }
function orchestrationPath(): string { return path.join(dataDir(), "master-agent-orchestration-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPlan(plan: MasterAgentOrchestrationPlan): void { ensureStore(); appendFileSync(orchestrationPath(), JSON.stringify(plan)+"\n", "utf8"); }
function stepsFor(action:any): Array<{ id:string; title:string; targetHref?:string; safetyGate:string }>{
  const type=String(action?.actionType||"");
  const common=[{ id:"audit", title:"Audit Trail nachführen", targetHref:"/governance-audit", safetyGate:"audit_required" }];
  if(type==="prepare_agent_blueprint") return [{ id:"review_blueprint", title:"Agent Blueprint prüfen", targetHref:"/agent-blueprints", safetyGate:"human_review_required" }, { id:"registry_gate", title:"Registry Gate prüfen", targetHref:"/agent-registry", safetyGate:"registry_required" }, ...common];
  if(type==="prepare_runtime_dry_run") return [{ id:"runtime_envelope", title:"Runtime Dry-run Envelope vorbereiten", targetHref:"/agent-runtime-dashboard", safetyGate:"dry_run_only" }, { id:"consent_gate", title:"Runtime Consent Gate prüfen", targetHref:"/agent-runtime-consent", safetyGate:"consent_required" }, ...common];
  if(type==="prepare_tool_adapter_plan") return [{ id:"tool_plan", title:"Tool Adapter Dry-run Plan vorbereiten", targetHref:"/tool-adapter-dashboard", safetyGate:"dry_run_only" }, { id:"tool_consent_gate", title:"Tool Adapter Consent Gate prüfen", targetHref:"/tool-adapter-consent", safetyGate:"consent_required" }, ...common];
  if(type==="review_capabilities") return [{ id:"capability_review", title:"Capability Requests prüfen", targetHref:"/capability-requests", safetyGate:"human_review_required" }, ...common];
  if(type==="review_agent_registry") return [{ id:"registry_review", title:"Agent Registry prüfen", targetHref:"/agent-registry", safetyGate:"registry_required" }, ...common];
  return [{ id:"audit_review", title:"Audit Trail prüfen", targetHref:"/governance-audit", safetyGate:"audit_required" }];
}
export function listMasterAgentOrchestrationPlans(limit=100): MasterAgentOrchestrationPlan[] { ensureStore(); return readJsonl(orchestrationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createMasterAgentOrchestrationPlan(input:{ actionPlanId?: string; metadata?: Record<string, unknown> }): MasterAgentOrchestrationPlan {
  ensureStore();
  const actions=readJsonl(actionPlansPath());
  const action=input.actionPlanId ? actions.find((entry:any)=>entry.id===input.actionPlanId) : actions[0];
  let decision: OrchestrationDecision="planned";
  let reason="Master Agent Orchestration Plan erstellt. Phase 15.0 erlaubt nur Planung, keine Ausführung.";
  if(!action){ decision="blocked_missing_action"; reason="Cockpit Action Plan nicht gefunden."; }
  else if(action.executionAllowed!==false || action.toolExecutionAllowed!==false || action.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Cockpit Action Plan verletzt Safety Invariants."; }
  const plan: MasterAgentOrchestrationPlan={
    id: makeId("orchestration-plan"),
    timestamp: new Date().toISOString(),
    sourceActionPlanId: action?.id || input.actionPlanId,
    actionType: action?.actionType,
    title: action ? "Orchestration: "+action.title : "Blocked Orchestration",
    targetHref: action?.targetHref,
    decision,
    orchestrationSteps: action ? stepsFor(action) : [],
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"15.0", noExecution:true },
  };
  appendPlan(plan);
  return plan;
}
export function summarizeMasterAgentOrchestrationPlans(plans: MasterAgentOrchestrationPlan[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const plan of plans){ byDecision[plan.decision]=(byDecision[plan.decision]||0)+1; if(plan.actionType) byActionType[plan.actionType]=(byActionType[plan.actionType]||0)+1; } return { total: plans.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createMasterAgentOrchestrationPlan, listMasterAgentOrchestrationPlans, summarizeMasterAgentOrchestrationPlans } from "../../../lib/master-agent-orchestrator-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const plans=listMasterAgentOrchestrationPlans(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeMasterAgentOrchestrationPlans(plans), plans });
  } catch(error){
    const message=error instanceof Error ? error.message : "Orchestration Plans konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const plan=createMasterAgentOrchestrationPlan({ actionPlanId: typeof body.actionPlanId==="string" ? body.actionPlanId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, plan });
  } catch(error){
    const message=error instanceof Error ? error.message : "Orchestration Plan konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
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
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "master-orchestrator"')){
    const marker='{ href: "/cockpit-actions", label: "Actions", key: "cockpit-actions" },';
    const line='  { href: "/master-orchestrator", label: "Orchestrator", key: "master-orchestrator" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Orchestrator Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Orchestrator bereits vorhanden.");
}
function patchCockpit(){
  const file="frontend/app/master-cockpit/page.tsx";
  if(!exists(file)) return;
  let content=read(file); const original=content;
  if(!content.includes('/master-orchestrator')){
    content=content.replace('<section className="panel-card"><h2>Action History</h2>', '<section className="panel-card"><h2>Master Agent Orchestrator</h2><p>Orchestration Plans aus Cockpit Actions ableiten, weiterhin ohne Ausführung.</p><a className="primary-button" href="/master-orchestrator">Orchestrator öffnen</a></section><section className="panel-card"><h2>Action History</h2>');
  }
  if(content!==original){ write(file, content); console.log("OK master-cockpit: Orchestrator Link ergänzt."); }
}
function patchDocs(){
  ensureFile("phase15-0-master-agent-orchestrator-planning.md", `# Phase 15.0 – Master Agent Orchestrator Planning Layer

## Ziel
Cockpit Action Plans werden vom Master Agent Orchestrator in sichere Orchestration Plans überführt.

## Neue UI/API
- UI: /master-orchestrator
- API: /api/master-orchestrator
- Store: data/master-agent-orchestration-plans.jsonl

## Sicherheitsprinzip
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Zweck
Das ist der erste echte Master-Agent-Orchestrierungs-Layer: er plant, routet und beschreibt Sicherheitsgates, führt aber nichts aus.

## Nächster Schritt
Phase 15.1 kann Orchestration Policy Simulation & Audit ergänzen.
`);
  ensureFile("docs/phase15-master-agent-orchestrator-planning-runbook.md", `# Runbook – Phase 15.0 Master Agent Orchestrator Planning Layer

## Patch
\`\`\`powershell
npm run phase15:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase15-0-patch-master-agent-orchestrator-planning.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase15:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /cockpit-actions: Action Plan vorhanden.
2. /master-orchestrator öffnen.
3. Action Plan auswählen.
4. Orchestration Plan erzeugen.
5. Prüfen: executionAllowed=false, toolExecutionAllowed=false, agentExecutionAllowed=false, dryRunOnly=true.
`);
}
patchPackage();
ensureFile("frontend/lib/master-agent-orchestrator-store.ts", store);
ensureFile("frontend/app/api/master-orchestrator/route.ts", api);
ensureFile("frontend/app/master-orchestrator/page.tsx", page);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 15.0 Patch abgeschlossen.");
