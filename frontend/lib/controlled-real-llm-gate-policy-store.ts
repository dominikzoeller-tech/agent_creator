import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmGatePolicyDecision =
  | "simulation_allowed_gate_only"
  | "blocked_missing_gate"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_missing_required_gate";

export interface ControlledRealLlmGatePolicySimulation {
  id: string;
  timestamp: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmGatePolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmCallPerformed: false;
  realLlmCallAllowed: false;
  policyGateRequired: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function simulationsPath(): string { return path.join(dataDir(), "controlled-real-llm-gate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ControlledRealLlmGatePolicySimulation): void { ensureStore(); appendFileSync(simulationsPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listControlledRealLlmGatePolicySimulations(limit=100): ControlledRealLlmGatePolicySimulation[] { ensureStore(); return readJsonl(simulationsPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateControlledRealLlmGatePolicy(input:{ gateId?: string; metadata?: Record<string, unknown> }): ControlledRealLlmGatePolicySimulation {
  ensureStore();
  const gates=readJsonl(gatesPath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"gate_exists", passed:Boolean(gate), reason: gate ? "Real LLM Call Gate gefunden." : "Real LLM Call Gate fehlt." });
  checks.push({ name:"real_llm_not_allowed", passed: gate?.realLlmCallAllowed === false, reason: gate?.realLlmCallAllowed === false ? "Real LLM Call bleibt blockiert." : "Real LLM Call wäre erlaubt." });
  checks.push({ name:"llm_call_not_performed", passed: gate?.llmCallPerformed === false, reason: gate?.llmCallPerformed === false ? "Kein LLM-Aufruf erfolgt." : "LLM-Aufruf wurde durchgeführt." });
  checks.push({ name:"policy_gate_required", passed: gate?.policyGateRequired === true && gate?.invocationPlan?.policyGateRequired === true, reason: "Policy Gate muss vor Invocation verpflichtend sein." });
  checks.push({ name:"secret_scan_required", passed: gate?.invocationPlan?.secretScanRequired === true, reason: "Secret Scan muss vor Invocation verpflichtend sein." });
  checks.push({ name:"output_contract_required", passed: gate?.invocationPlan?.outputContractRequired === true, reason: "Output Contract muss vor Invocation verpflichtend sein." });
  checks.push({ name:"audit_required", passed: gate?.invocationPlan?.auditRequiredBeforeCall === true && gate?.invocationPlan?.auditRequiredAfterDecision === true, reason: "Audit muss vor Call und nach Entscheidung verpflichtend sein." });
  checks.push({ name:"execution_blocked", passed: gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason: "Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"no_secret_risk", passed: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview), reason: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  let decision: RealLlmGatePolicyDecision="simulation_allowed_gate_only";
  let reason="Real LLM Gate Policy Simulation erlaubt nur Gate-Prep. Kein produktiver LLM-Aufruf.";
  if(!gate){ decision="blocked_missing_gate"; reason="Real LLM Call Gate nicht gefunden."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Gate verletzt Execution Safety Invariants."; }
  else if(gate.noSecretsIncluded !== true || containsSecretPattern(gate.sanitizedPromptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Real LLM Gate erkannt."; }
  else if(checks.some((check)=>check.passed !== true)){ decision="blocked_missing_required_gate"; reason="Mindestens ein verpflichtendes Gate fehlt."; }
  const sim: ControlledRealLlmGatePolicySimulation={
    id:makeId("real-llm-gate-policy-sim"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    responseId:gate?.responseId,
    envelopeId:gate?.envelopeId,
    recommendationId:gate?.recommendationId,
    actionType:gate?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmCallPerformed:false,
    realLlmCallAllowed:false,
    policyGateRequired:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"19.1", noExecution:true, noRealLlmCall:true, policyGateRequired:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.gateId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Controlled Real LLM Gate Policy Simulation: "+sim.decision,
    metadata:{ source:"phase19.1-real-llm-gate-policy", simulationId:sim.id, realLlmCallAllowed:false, llmCallPerformed:false, policyGateRequired:true, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false },
  });
  return sim;
}
export function summarizeControlledRealLlmGatePolicySimulations(sims:ControlledRealLlmGatePolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
