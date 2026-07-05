import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
  checks.push({ name:"execution_blocked", passed: rec?.executionAllowed === false, reason: rec?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wÃ¤re nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: rec?.toolExecutionAllowed === false, reason: rec?.toolExecutionAllowed === false ? "Tool-AusfÃ¼hrung bleibt blockiert." : "Tool-AusfÃ¼hrung wÃ¤re nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: rec?.agentExecutionAllowed === false, reason: rec?.agentExecutionAllowed === false ? "Agent-AusfÃ¼hrung bleibt blockiert." : "Agent-AusfÃ¼hrung wÃ¤re nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: rec?.dryRunOnly === true, reason: rec?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"llm_routing_prep_only", passed: rec?.llmRoutingPrepOnly === true, reason: rec?.llmRoutingPrepOnly === true ? "Nur LLM-Routing-Prep." : "LLM-Routing-Prep fehlt." });
  checks.push({ name:"policy_steps_present", passed: Array.isArray(rec?.requiredPolicySteps) && rec.requiredPolicySteps.length > 0, reason: Array.isArray(rec?.requiredPolicySteps) && rec.requiredPolicySteps.length > 0 ? "Policy Steps vorhanden." : "Policy Steps fehlen." });
  let decision: PlannerPolicyDecision="simulation_allowed_dry_run";
  let reason="Planner Policy Simulation erlaubt ausschlieÃŸlich Dry-run-/Routing-Vorbereitung. Keine echte AusfÃ¼hrung.";
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

