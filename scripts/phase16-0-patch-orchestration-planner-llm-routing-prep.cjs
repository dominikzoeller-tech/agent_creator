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
  pkg.scripts["phase16:0:patch"]="node scripts/phase16-0-patch-orchestration-planner-llm-routing-prep.cjs";
  pkg.scripts["phase16:0:verify"]="node scripts/phase16-0-verify-orchestration-planner-llm-routing-prep.cjs";
  pkg.scripts["planner:routing:verify"]="node scripts/phase16-0-verify-orchestration-planner-llm-routing-prep.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 16.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type PlannerRecommendationDecision = "recommendation_created" | "blocked_missing_orchestration_plan" | "blocked_execution_not_safe";
export interface MasterAgentPlannerRecommendation {
  id: string;
  timestamp: string;
  orchestrationPlanId?: string;
  actionType?: string;
  title: string;
  recommendedNextAction: string;
  missingSafetyGates: string[];
  requiredConsentSteps: string[];
  requiredPolicySteps: string[];
  targetHref?: string;
  decision: PlannerRecommendationDecision;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function orchestrationPath(): string { return path.join(dataDir(), "master-agent-orchestration-plans.jsonl"); }
function recommendationsPath(): string { return path.join(dataDir(), "master-agent-planner-recommendations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendRecommendation(rec: MasterAgentPlannerRecommendation): void { ensureStore(); appendFileSync(recommendationsPath(), JSON.stringify(rec)+"\n", "utf8"); }
function missingGates(plan:any): string[] {
  const steps = Array.isArray(plan?.orchestrationSteps) ? plan.orchestrationSteps : [];
  const gates = new Set(steps.map((s:any)=>String(s.safetyGate||"")));
  const required = ["audit_required"];
  if(String(plan?.actionType||"").includes("tool")) required.push("consent_required", "dry_run_only");
  if(String(plan?.actionType||"").includes("runtime")) required.push("consent_required", "dry_run_only");
  if(String(plan?.actionType||"").includes("blueprint")) required.push("human_review_required", "registry_required");
  return required.filter((g)=>!gates.has(g));
}
function consentSteps(plan:any): string[] { const type=String(plan?.actionType||""); if(type.includes("tool")) return ["Tool Adapter Consent Binding prüfen"]; if(type.includes("runtime")) return ["Runtime Consent Binding prüfen"]; return []; }
function policySteps(plan:any): string[] { return ["Orchestration Policy Simulation ausführen", "Governance Audit prüfen"]; }
function nextAction(plan:any, missing:string[]): string {
  if(missing.length>0) return "Fehlende Safety Gates ergänzen: "+missing.join(", ");
  if(String(plan?.actionType||"")==="prepare_tool_adapter_plan") return "Tool Adapter Dry-run Plan und Consent prüfen";
  if(String(plan?.actionType||"")==="prepare_runtime_dry_run") return "Runtime Dry-run und Consent prüfen";
  if(String(plan?.actionType||"")==="prepare_agent_blueprint") return "Agent Blueprint und Registry Gate prüfen";
  return "Audit und nächste sichere Cockpit Action prüfen";
}
export function listMasterAgentPlannerRecommendations(limit=100): MasterAgentPlannerRecommendation[] { ensureStore(); return readJsonl(recommendationsPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createMasterAgentPlannerRecommendation(input:{ orchestrationPlanId?: string; metadata?: Record<string, unknown> }): MasterAgentPlannerRecommendation {
  ensureStore();
  const plans=readJsonl(orchestrationPath());
  const plan=input.orchestrationPlanId ? plans.find((entry:any)=>entry.id===input.orchestrationPlanId) : plans[0];
  let decision: PlannerRecommendationDecision="recommendation_created";
  let reason="Planner Recommendation erstellt. Phase 16.0 bereitet nur LLM-Routing vor, keine Ausführung.";
  if(!plan){ decision="blocked_missing_orchestration_plan"; reason="Orchestration Plan nicht gefunden."; }
  else if(plan.executionAllowed!==false || plan.toolExecutionAllowed!==false || plan.agentExecutionAllowed!==false || plan.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Orchestration Plan verletzt Safety Invariants."; }
  const missing=plan?missingGates(plan):[];
  const rec: MasterAgentPlannerRecommendation={
    id: makeId("planner-rec"),
    timestamp:new Date().toISOString(),
    orchestrationPlanId:plan?.id || input.orchestrationPlanId,
    actionType:plan?.actionType,
    title:plan ? "Planner Recommendation: "+plan.title : "Blocked Planner Recommendation",
    recommendedNextAction:plan ? nextAction(plan, missing) : "Zuerst Orchestration Plan erzeugen",
    missingSafetyGates:missing,
    requiredConsentSteps:plan?consentSteps(plan):[],
    requiredPolicySteps:plan?policySteps(plan):[],
    targetHref:plan?.targetHref,
    decision,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"16.0", noExecution:true },
  };
  appendRecommendation(rec);
  return rec;
}
export function summarizeMasterAgentPlannerRecommendations(recs: MasterAgentPlannerRecommendation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const rec of recs){ byDecision[rec.decision]=(byDecision[rec.decision]||0)+1; if(rec.actionType) byActionType[rec.actionType]=(byActionType[rec.actionType]||0)+1; } return { total:recs.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createMasterAgentPlannerRecommendation, listMasterAgentPlannerRecommendations, summarizeMasterAgentPlannerRecommendations } from "../../../lib/master-agent-planner-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const recommendations=listMasterAgentPlannerRecommendations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeMasterAgentPlannerRecommendations(recommendations), recommendations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Recommendations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const recommendation=createMasterAgentPlannerRecommendation({ orchestrationPlanId: typeof body.orchestrationPlanId==="string" ? body.orchestrationPlanId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, recommendation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Recommendation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Plan={id:string;title:string;decision:string;actionType?:string};
type Rec={id:string;timestamp:string;title:string;decision:string;actionType?:string;recommendedNextAction:string;missingSafetyGates:string[];requiredConsentSteps:string[];requiredPolicySteps:string[];executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;llmRoutingPrepOnly:boolean;reason:string};
export default function MasterPlannerPage(){
 const [plans,setPlans]=useState<Plan[]>([]); const [recs,setRecs]=useState<Rec[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,rRes]=await Promise.all([fetch("/api/master-orchestrator?limit=100",{cache:"no-store"}),fetch("/api/master-planner?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const r=await rRes.json(); if(pRes.ok){ const list=Array.isArray(p.plans)?p.plans:[]; setPlans(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!rRes.ok) throw new Error(r?.error||"Planner Recommendations konnten nicht geladen werden."); setRecs(Array.isArray(r.recommendations)?r.recommendations:[]); setSummary(r.summary||null); } catch(e){ setError(e instanceof Error?e.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function recommend(){ const res=await fetch("/api/master-planner",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orchestrationPlanId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Recommendation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="master-planner" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Master Agent Planner</h1><p style={{lineHeight:1.6}}>Phase 16.0 bewertet Orchestration Plans und erzeugt sichere Next-Step-Empfehlungen. LLM-Routing-Prep, keine echte Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Recommendation erzeugen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{plans.map((plan)=><option key={plan.id} value={plan.id}>{plan.title} · {plan.decision} · {plan.id}</option>)}</select><button className="primary-button" type="button" onClick={recommend} disabled={!selected}>Planner Recommendation erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Recommendations</h2>{recs.length===0 ? <p>Noch keine Planner Recommendations.</p> : recs.map((rec)=><article key={rec.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{rec.title}</strong> <span className="chip">{rec.decision}</span></div><div className="helper-text"><code>{rec.id}</code> · {rec.timestamp}</div><p><strong>Next:</strong> {rec.recommendedNextAction}</p><p><strong>Missing Gates:</strong> {rec.missingSafetyGates.length?rec.missingSafetyGates.join(", "):"none"}</p><p><strong>Consent:</strong> {rec.requiredConsentSteps.length?rec.requiredConsentSteps.join(", "):"none"}</p><p><strong>Policy:</strong> {rec.requiredPolicySteps.join(", ")}</p><p><strong>Execution:</strong> {String(rec.executionAllowed)} · <strong>Tool:</strong> {String(rec.toolExecutionAllowed)} · <strong>Agent:</strong> {String(rec.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(rec.dryRunOnly)} · <strong>LLM Routing Prep:</strong> {String(rec.llmRoutingPrepOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "master-planner"')){ const marker='{ href: "/master-orchestrator-dashboard", label: "Orch Dashboard", key: "master-orchestrator-dashboard" },'; const line='  { href: "/master-planner", label: "Planner", key: "master-planner" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Planner Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Planner bereits vorhanden.");
}
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content; if(!content.includes('/master-planner')){ content=content.replace('<a className="secondary-button" href="/master-orchestrator-dashboard">Orchestrator Dashboard</a>', '<a className="secondary-button" href="/master-orchestrator-dashboard">Orchestrator Dashboard</a> <a className="secondary-button" href="/master-planner">Planner</a>'); } if(content!==original){ write(file, content); console.log("OK master-cockpit: Planner Link ergänzt."); } }
function patchDocs(){
 ensureFile("phase16-0-master-agent-orchestration-planner-llm-routing-prep.md", `# Phase 16.0 – Master Agent Orchestration Planner Integration / LLM-Routing Prep

## Ziel
Orchestration Plans werden semantisch bewertet und in sichere Master-Agent-Next-Step-Empfehlungen überführt.

## Neue UI/API
- UI: /master-planner
- API: /api/master-planner
- Store: data/master-agent-planner-recommendations.jsonl

## Sicherheitsprinzip
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Zweck
Phase 16.0 bereitet späteres LLM-Routing vor, ohne ein LLM aufzurufen oder Ausführung zu starten.

## Nächster Schritt
Phase 16.1 kann Planner Policy Simulation & Audit ergänzen.
`);
 ensureFile("docs/phase16-master-agent-orchestration-planner-runbook.md", `# Runbook – Phase 16.0 Master Agent Orchestration Planner

## Patch
\`\`\`powershell
npm run phase16:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase16-0-patch-orchestration-planner-llm-routing-prep.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase16:0:verify
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
ensureFile("frontend/lib/master-agent-planner-store.ts", store);
ensureFile("frontend/app/api/master-planner/route.ts", api);
ensureFile("frontend/app/master-planner/page.tsx", page);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 16.0 Patch abgeschlossen.");
