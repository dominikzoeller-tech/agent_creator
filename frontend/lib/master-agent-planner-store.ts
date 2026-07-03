import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
