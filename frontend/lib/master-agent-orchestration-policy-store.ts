import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
