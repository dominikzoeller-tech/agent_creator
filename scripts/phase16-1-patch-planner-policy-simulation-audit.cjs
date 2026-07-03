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
  pkg.scripts["phase16:1:patch"]="node scripts/phase16-1-patch-planner-policy-simulation-audit.cjs";
  pkg.scripts["phase16:1:verify"]="node scripts/phase16-1-verify-planner-policy-simulation-audit.cjs";
  pkg.scripts["planner:policy:verify"]="node scripts/phase16-1-verify-planner-policy-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 16.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type PlannerPolicyDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_recommendation"
  | "blocked_execution_not_safe"
  | "blocked_missing_policy_steps"
  | "blocked_policy_violation";

export interface MasterAgentPlannerPolicySimulation {
  id: string;
  timestamp: string;
  recommendationId?: string;
  orchestrationPlanId?: string;
  actionType?: string;
  decision: PlannerPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function recommendationsPath(): string { return path.join(dataDir(), "master-agent-planner-recommendations.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "master-agent-planner-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: MasterAgentPlannerPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
export function listMasterAgentPlannerPolicySimulations(limit=100): MasterAgentPlannerPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateMasterAgentPlannerPolicy(input:{ recommendationId?: string; metadata?: Record<string, unknown> }): MasterAgentPlannerPolicySimulation {
  ensureStore();
  const recommendations=readJsonl(recommendationsPath());
  const rec=input.recommendationId ? recommendations.find((entry:any)=>entry.id===input.recommendationId) : recommendations[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"recommendation_exists", passed:Boolean(rec), reason: rec ? "Planner Recommendation gefunden." : "Planner Recommendation fehlt." });
  checks.push({ name:"execution_blocked", passed: rec?.executionAllowed === false, reason: rec?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wäre nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: rec?.toolExecutionAllowed === false, reason: rec?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: rec?.agentExecutionAllowed === false, reason: rec?.agentExecutionAllowed === false ? "Agent-Ausführung bleibt blockiert." : "Agent-Ausführung wäre nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: rec?.dryRunOnly === true, reason: rec?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"llm_routing_prep_only", passed: rec?.llmRoutingPrepOnly === true, reason: rec?.llmRoutingPrepOnly === true ? "Nur LLM-Routing-Prep." : "LLM-Routing-Prep fehlt." });
  checks.push({ name:"policy_steps_present", passed: Array.isArray(rec?.requiredPolicySteps) && rec.requiredPolicySteps.length > 0, reason: Array.isArray(rec?.requiredPolicySteps) && rec.requiredPolicySteps.length > 0 ? "Policy Steps vorhanden." : "Policy Steps fehlen." });
  let decision: PlannerPolicyDecision="simulation_allowed_dry_run";
  let reason="Planner Policy Simulation erlaubt ausschließlich Dry-run-/Routing-Vorbereitung. Keine echte Ausführung.";
  if(!rec){ decision="blocked_missing_recommendation"; reason="Planner Recommendation nicht gefunden."; }
  else if(rec.executionAllowed!==false || rec.toolExecutionAllowed!==false || rec.agentExecutionAllowed!==false || rec.dryRunOnly!==true || rec.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="Planner Recommendation verletzt Safety Invariants."; }
  else if(!Array.isArray(rec.requiredPolicySteps) || rec.requiredPolicySteps.length===0){ decision="blocked_missing_policy_steps"; reason="Policy Steps fehlen."; }
  else if(checks.some((check)=>!check.passed)){ decision="blocked_policy_violation"; reason="Mindestens ein Policy Check ist fehlgeschlagen."; }
  const sim: MasterAgentPlannerPolicySimulation={
    id: makeId("planner-policy-sim"),
    timestamp:new Date().toISOString(),
    recommendationId:rec?.id || input.recommendationId,
    orchestrationPlanId:rec?.orchestrationPlanId,
    actionType:rec?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"16.1", noExecution:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.recommendationId,
    status:sim.decision,
    riskLevel:"medium",
    summary:"Master Agent Planner Policy Simulation: "+sim.decision,
    metadata:{ source:"phase16.1-master-agent-planner-policy", simulationId:sim.id, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, llmRoutingPrepOnly:true },
  });
  return sim;
}
export function summarizeMasterAgentPlannerPolicySimulations(sims: MasterAgentPlannerPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listMasterAgentPlannerPolicySimulations, simulateMasterAgentPlannerPolicy, summarizeMasterAgentPlannerPolicySimulations } from "../../../lib/master-agent-planner-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listMasterAgentPlannerPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeMasterAgentPlannerPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateMasterAgentPlannerPolicy({ recommendationId: typeof body.recommendationId==="string" ? body.recommendationId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Rec={id:string;title:string;decision:string;actionType?:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;llmRoutingPrepOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function MasterPlannerPolicyPage(){
 const [recs,setRecs]=useState<Rec[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,sRes]=await Promise.all([fetch("/api/master-planner?limit=100",{cache:"no-store"}),fetch("/api/master-planner-policy?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const s=await sRes.json(); if(rRes.ok){ const list=Array.isArray(r.recommendations)?r.recommendations:[]; setRecs(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Planner Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(e){ setError(e instanceof Error?e.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/master-planner-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recommendationId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="master-planner-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Master Planner Policy</h1><p style={{lineHeight:1.6}}>Phase 16.1 simuliert Policy Checks für Planner Recommendations und schreibt Audit Events. Keine echte Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{recs.map((rec)=><option key={rec.id} value={rec.id}>{rec.title} · {rec.decision} · {rec.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Planner Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Planner Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "planner"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)} · <strong>LLM Routing Prep:</strong> {String(sim.llmRoutingPrepOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "master-planner-policy"')){ const marker='{ href: "/master-planner", label: "Planner", key: "master-planner" },'; const line='  { href: "/master-planner-policy", label: "Planner Policy", key: "master-planner-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Planner Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Planner Policy bereits vorhanden."); }
function patchDocs(){ ensureFile("phase16-1-planner-policy-simulation-audit.md", `# Phase 16.1 – Planner Policy Simulation & Audit

## Ziel
Planner Recommendations werden gegen Policy Checks simuliert und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /master-planner-policy
- API: /api/master-planner-policy
- Store: data/master-agent-planner-policy-simulations.jsonl

## Sicherheitsprinzip
- keine echte Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Nächster Schritt
Phase 16.2 kann Planner Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase16-planner-policy-simulation-audit-runbook.md", `# Runbook – Phase 16.1 Planner Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase16:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase16-1-patch-planner-policy-simulation-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase16:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/master-agent-planner-policy-store.ts", store);
ensureFile("frontend/app/api/master-planner-policy/route.ts", api);
ensureFile("frontend/app/master-planner-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 16.1 Patch abgeschlossen.");
