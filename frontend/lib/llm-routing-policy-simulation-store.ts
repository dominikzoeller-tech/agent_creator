import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type LlmRoutingPolicyDecision =
  | "simulation_allowed_explanation_only"
  | "blocked_missing_envelope"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation";

export interface LlmRoutingPolicySimulation {
  id: string;
  timestamp: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: LlmRoutingPolicyDecision;
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
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "controlled-llm-routing-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: LlmRoutingPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listLlmRoutingPolicySimulations(limit=100): LlmRoutingPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateLlmRoutingPolicy(input:{ envelopeId?: string; metadata?: Record<string, unknown> }): LlmRoutingPolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.envelopeId ? envelopes.find((entry:any)=>entry.id===input.envelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"envelope_exists", passed:Boolean(envelope), reason: envelope ? "LLM Routing Envelope gefunden." : "LLM Routing Envelope fehlt." });
  checks.push({ name:"execution_blocked", passed: envelope?.executionAllowed === false, reason: envelope?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wÃ¤re nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: envelope?.toolExecutionAllowed === false, reason: envelope?.toolExecutionAllowed === false ? "Tool-AusfÃ¼hrung bleibt blockiert." : "Tool-AusfÃ¼hrung wÃ¤re nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: envelope?.agentExecutionAllowed === false, reason: envelope?.agentExecutionAllowed === false ? "Agent-AusfÃ¼hrung bleibt blockiert." : "Agent-AusfÃ¼hrung wÃ¤re nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: envelope?.dryRunOnly === true, reason: envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"llm_routing_prep_only", passed: envelope?.llmRoutingPrepOnly === true, reason: envelope?.llmRoutingPrepOnly === true ? "Nur LLM-Routing-Prep." : "LLM-Routing-Prep fehlt." });
  checks.push({ name:"no_secrets", passed: envelope?.noSecretsIncluded === true && !containsSecretPattern(envelope?.sanitizedContext), reason: envelope?.noSecretsIncluded === true && !containsSecretPattern(envelope?.sanitizedContext) ? "Sanitized Context enthÃ¤lt keine secret-artigen Muster." : "Secret-Risiko im Kontext." });
  checks.push({ name:"output_contract", passed: envelope?.allowedOutputContract?.outputType === "recommendation_explanation_only" && envelope?.allowedOutputContract?.mayExecuteTools === false && envelope?.allowedOutputContract?.mayExecuteAgents === false && envelope?.allowedOutputContract?.mayRevealSecrets === false && envelope?.allowedOutputContract?.mayChangeState === false, reason: "Output Contract muss ErklÃ¤rung-only und nicht-ausfÃ¼hrend sein." });
  let decision: LlmRoutingPolicyDecision="simulation_allowed_explanation_only";
  let reason="LLM Routing Policy Simulation erlaubt nur Empfehlung/ErklÃ¤rung. Keine echte AusfÃ¼hrung und kein LLM-Aufruf.";
  if(!envelope){ decision="blocked_missing_envelope"; reason="LLM Routing Envelope nicht gefunden."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true || envelope.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="LLM Routing Envelope verletzt Safety Invariants."; }
  else if(envelope.noSecretsIncluded!==true || containsSecretPattern(envelope.sanitizedContext)){ decision="blocked_secret_risk"; reason="Sanitized Context enthÃ¤lt Secret-Risiko."; }
  else if(checks.find((c)=>c.name==="output_contract")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt Explanation-only-Regeln."; }
  const sim: LlmRoutingPolicySimulation={
    id: makeId("llm-policy-sim"),
    timestamp:new Date().toISOString(),
    envelopeId:envelope?.id || input.envelopeId,
    recommendationId:envelope?.recommendationId,
    actionType:envelope?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"17.1", noExecution:true, noLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.envelopeId,
    status:sim.decision,
    riskLevel:"medium",
    summary:"Controlled LLM Routing Policy Simulation: "+sim.decision,
    metadata:{ source:"phase17.1-llm-routing-policy", simulationId:sim.id, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, llmRoutingPrepOnly:true },
  });
  return sim;
}
export function summarizeLlmRoutingPolicySimulations(sims: LlmRoutingPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }

