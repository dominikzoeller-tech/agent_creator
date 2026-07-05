import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
  const common=[{ id:"audit", title:"Audit Trail nachfÃ¼hren", targetHref:"/governance-audit", safetyGate:"audit_required" }];
  if(type==="prepare_agent_blueprint") return [{ id:"review_blueprint", title:"Agent Blueprint prÃ¼fen", targetHref:"/agent-blueprints", safetyGate:"human_review_required" }, { id:"registry_gate", title:"Registry Gate prÃ¼fen", targetHref:"/agent-registry", safetyGate:"registry_required" }, ...common];
  if(type==="prepare_runtime_dry_run") return [{ id:"runtime_envelope", title:"Runtime Dry-run Envelope vorbereiten", targetHref:"/agent-runtime-dashboard", safetyGate:"dry_run_only" }, { id:"consent_gate", title:"Runtime Consent Gate prÃ¼fen", targetHref:"/agent-runtime-consent", safetyGate:"consent_required" }, ...common];
  if(type==="prepare_tool_adapter_plan") return [{ id:"tool_plan", title:"Tool Adapter Dry-run Plan vorbereiten", targetHref:"/tool-adapter-dashboard", safetyGate:"dry_run_only" }, { id:"tool_consent_gate", title:"Tool Adapter Consent Gate prÃ¼fen", targetHref:"/tool-adapter-consent", safetyGate:"consent_required" }, ...common];
  if(type==="review_capabilities") return [{ id:"capability_review", title:"Capability Requests prÃ¼fen", targetHref:"/capability-requests", safetyGate:"human_review_required" }, ...common];
  if(type==="review_agent_registry") return [{ id:"registry_review", title:"Agent Registry prÃ¼fen", targetHref:"/agent-registry", safetyGate:"registry_required" }, ...common];
  return [{ id:"audit_review", title:"Audit Trail prÃ¼fen", targetHref:"/governance-audit", safetyGate:"audit_required" }];
}
export function listMasterAgentOrchestrationPlans(limit=100): MasterAgentOrchestrationPlan[] { ensureStore(); return readJsonl(orchestrationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createMasterAgentOrchestrationPlan(input:{ actionPlanId?: string; metadata?: Record<string, unknown> }): MasterAgentOrchestrationPlan {
  ensureStore();
  const actions=readJsonl(actionPlansPath());
  const action=input.actionPlanId ? actions.find((entry:any)=>entry.id===input.actionPlanId) : actions[0];
  let decision: OrchestrationDecision="planned";
  let reason="Master Agent Orchestration Plan erstellt. Phase 15.0 erlaubt nur Planung, keine AusfÃ¼hrung.";
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

