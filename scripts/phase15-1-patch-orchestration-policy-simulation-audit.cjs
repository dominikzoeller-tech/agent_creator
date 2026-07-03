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
  pkg.scripts["phase15:1:patch"]="node scripts/phase15-1-patch-orchestration-policy-simulation-audit.cjs";
  pkg.scripts["phase15:1:verify"]="node scripts/phase15-1-verify-orchestration-policy-simulation-audit.cjs";
  pkg.scripts["orchestrator:policy:verify"]="node scripts/phase15-1-verify-orchestration-policy-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 15.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type OrchestrationPolicyDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_orchestration_plan"
  | "blocked_execution_not_safe"
  | "blocked_missing_safety_steps"
  | "blocked_policy_violation";

export interface MasterAgentOrchestrationPolicySimulation {
  id: string;
  timestamp: string;
  orchestrationPlanId?: string;
  sourceActionPlanId?: string;
  actionType?: string;
  decision: OrchestrationPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function orchestrationPath(): string { return path.join(dataDir(), "master-agent-orchestration-plans.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "master-agent-orchestration-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: MasterAgentOrchestrationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
export function listMasterAgentOrchestrationPolicySimulations(limit=100): MasterAgentOrchestrationPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateMasterAgentOrchestrationPolicy(input:{ orchestrationPlanId?: string; metadata?: Record<string, unknown> }): MasterAgentOrchestrationPolicySimulation {
  ensureStore();
  const plans=readJsonl(orchestrationPath());
  const plan=input.orchestrationPlanId ? plans.find((entry:any)=>entry.id===input.orchestrationPlanId) : plans[0];
  const checks: Array<{ name:string; passed:boolean; reason:string }> = [];
  checks.push({ name:"orchestration_plan_exists", passed:Boolean(plan), reason: plan ? "Orchestration Plan gefunden." : "Orchestration Plan fehlt." });
  checks.push({ name:"execution_blocked", passed: plan?.executionAllowed === false, reason: plan?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wäre nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: plan?.toolExecutionAllowed === false, reason: plan?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: plan?.agentExecutionAllowed === false, reason: plan?.agentExecutionAllowed === false ? "Agent-Ausführung bleibt blockiert." : "Agent-Ausführung wäre nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: plan?.dryRunOnly === true, reason: plan?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"safety_steps_present", passed: Array.isArray(plan?.orchestrationSteps) && plan.orchestrationSteps.length > 0, reason: Array.isArray(plan?.orchestrationSteps) && plan.orchestrationSteps.length > 0 ? "Safety Steps vorhanden." : "Safety Steps fehlen." });
  let decision: OrchestrationPolicyDecision = "simulation_allowed_dry_run";
  let reason = "Master Agent Orchestration Policy Simulation erlaubt ausschließlich Dry-run-Planung. Keine echte Ausführung.";
  if(!plan){ decision="blocked_missing_orchestration_plan"; reason="Orchestration Plan nicht gefunden."; }
  else if(plan.executionAllowed !== false || plan.toolExecutionAllowed !== false || plan.agentExecutionAllowed !== false || plan.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(!Array.isArray(plan.orchestrationSteps) || plan.orchestrationSteps.length === 0){ decision="blocked_missing_safety_steps"; reason="Orchestration Safety Steps fehlen."; }
  else if(checks.some((check)=>!check.passed)){ decision="blocked_policy_violation"; reason="Mindestens ein Policy Check ist fehlgeschlagen."; }
  const simulation: MasterAgentOrchestrationPolicySimulation = {
    id: makeId("orch-policy-sim"),
    timestamp: new Date().toISOString(),
    orchestrationPlanId: plan?.id || input.orchestrationPlanId,
    sourceActionPlanId: plan?.sourceActionPlanId,
    actionType: plan?.actionType,
    decision,
    policyChecks: checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"15.1", noExecution:true },
  };
  appendSimulation(simulation);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId: simulation.orchestrationPlanId,
    status: simulation.decision,
    riskLevel:"medium",
    summary:"Master Agent Orchestration Policy Simulation: " + simulation.decision,
    metadata:{ source:"phase15.1-master-agent-orchestration-policy", simulationId:simulation.id, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true },
  });
  return simulation;
}
export function summarizeMasterAgentOrchestrationPolicySimulations(sims: MasterAgentOrchestrationPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listMasterAgentOrchestrationPolicySimulations, simulateMasterAgentOrchestrationPolicy, summarizeMasterAgentOrchestrationPolicySimulations } from "../../../lib/master-agent-orchestration-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listMasterAgentOrchestrationPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeMasterAgentOrchestrationPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Orchestration Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateMasterAgentOrchestrationPolicy({ orchestrationPlanId: typeof body.orchestrationPlanId==="string" ? body.orchestrationPlanId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Orchestration Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Plan={id:string;title:string;decision:string;actionType?:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function MasterOrchestratorPolicyPage(){
 const [plans,setPlans]=useState<Plan[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,sRes]=await Promise.all([fetch("/api/master-orchestrator?limit=100",{cache:"no-store"}), fetch("/api/master-orchestrator-policy?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const s=await sRes.json(); if(pRes.ok){ const list=Array.isArray(p.plans)?p.plans:[]; setPlans(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); } }
 useEffect(()=>{ load(); }, []);
 async function simulate(){ const res=await fetch("/api/master-orchestrator-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orchestrationPlanId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="master-orchestrator-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Master Orchestrator Policy</h1><p style={{lineHeight:1.6}}>Phase 15.1 simuliert Policy Checks für Master Agent Orchestration Plans und schreibt Audit Events. Keine echte Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{plans.map((plan)=><option key={plan.id} value={plan.id}>{plan.title} · {plan.decision} · {plan.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Orchestration Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Orchestration Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "orchestration"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "master-orchestrator-policy"')){ const marker='{ href: "/master-orchestrator", label: "Orchestrator", key: "master-orchestrator" },'; const line='  { href: "/master-orchestrator-policy", label: "Orch Policy", key: "master-orchestrator-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Orchestrator Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Orchestrator Policy bereits vorhanden.");
}
function patchDocs(){
 ensureFile("phase15-1-orchestration-policy-simulation-audit.md", `# Phase 15.1 – Orchestration Policy Simulation & Audit

## Ziel
Master Agent Orchestration Plans werden mit Policy Checks simuliert und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /master-orchestrator-policy
- API: /api/master-orchestrator-policy
- Store: data/master-agent-orchestration-policy-simulations.jsonl

## Sicherheitsprinzip
- keine echte Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 15.2 kann Orchestrator Dashboard / Smoke ergänzen.
`);
 ensureFile("docs/phase15-orchestration-policy-simulation-audit-runbook.md", `# Runbook – Phase 15.1 Orchestration Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase15:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase15-1-patch-orchestration-policy-simulation-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase15:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/lib/master-agent-orchestration-policy-store.ts", store);
ensureFile("frontend/app/api/master-orchestrator-policy/route.ts", api);
ensureFile("frontend/app/master-orchestrator-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 15.1 Patch abgeschlossen.");
