import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type InvocationEnvelopePolicyDecision =
  | "simulation_allowed_envelope_only"
  | "blocked_missing_invocation_envelope"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation"
  | "blocked_consent_state_invalid";

export interface InvocationEnvelopePolicySimulation {
  id: string;
  timestamp: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: InvocationEnvelopePolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  consentRequired: true;
  humanApprovalRequired: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: InvocationEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listInvocationEnvelopePolicySimulations(limit=100): InvocationEnvelopePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateInvocationEnvelopePolicy(input:{ invocationEnvelopeId?: string; metadata?: Record<string, unknown> }): InvocationEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const env=input.invocationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.invocationEnvelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"invocation_envelope_exists", passed:Boolean(env), reason: env ? "Invocation Envelope gefunden." : "Invocation Envelope fehlt." });
  checks.push({ name:"prep_only_mode", passed: env?.invocationEnvelope?.mode === "approved_invocation_envelope_prep_only", reason:"Envelope muss Prep-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed: env?.realLlmCallAllowed === false && env?.llmCallPerformed === false && env?.invocationEnvelope?.realLlmCallAllowed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"consent_required", passed: env?.consentRequired === true && env?.humanApprovalRequired === true, reason:"Consent und Human Approval mÃ¼ssen verpflichtend bleiben." });
  checks.push({ name:"consent_state_valid", passed: env?.approvalState?.acceptedForEnvelopePrep === true && env?.approvalState?.notExpired === true, reason:"Consent muss fÃ¼r Envelope Prep akzeptiert und nicht abgelaufen sein." });
  checks.push({ name:"execution_blocked", passed: env?.executionAllowed === false && env?.toolExecutionAllowed === false && env?.agentExecutionAllowed === false && env?.invocationEnvelope?.toolExecutionAllowed === false && env?.invocationEnvelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: env?.dryRunOnly === true, reason: env?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"final_secret_scan", passed: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview), reason: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_locked", passed: env?.outputContract?.outputType === "recommendation_explanation_only" && env?.outputContract?.mayExecuteTools === false && env?.outputContract?.mayExecuteAgents === false && env?.outputContract?.mayRevealSecrets === false && env?.outputContract?.mayChangeState === false && env?.invocationEnvelope?.outputContractLocked === true, reason:"Output Contract muss locked, explanation-only und nicht-ausfÃ¼hrend sein." });
  checks.push({ name:"audit_before_invocation_required", passed: env?.invocationEnvelope?.auditBeforeInvocationRequired === true, reason:"Audit vor Invocation bleibt erforderlich." });
  let decision: InvocationEnvelopePolicyDecision="simulation_allowed_envelope_only";
  let reason="Invocation Envelope Policy Simulation erlaubt nur Envelope/Prep. Kein produktiver LLM-Aufruf.";
  if(!env){ decision="blocked_missing_invocation_envelope"; reason="Invocation Envelope nicht gefunden."; }
  else if(env.realLlmCallAllowed !== false || env.llmCallPerformed !== false || env.invocationEnvelope?.realLlmCallAllowed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(env.executionAllowed !== false || env.toolExecutionAllowed !== false || env.agentExecutionAllowed !== false || env.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Execution Safety Invariants."; }
  else if(env.noSecretsIncluded !== true || containsSecretPattern(env.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Invocation Envelope erkannt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract ist nicht korrekt locked/explanation-only."; }
  else if(env.approvalState?.acceptedForEnvelopePrep !== true || env.approvalState?.notExpired !== true){ decision="blocked_consent_state_invalid"; reason="Consent State ist nicht gÃ¼ltig fÃ¼r Envelope Prep."; }
  const sim: InvocationEnvelopePolicySimulation={
    id:makeId("approved-envelope-policy-sim"),
    timestamp:new Date().toISOString(),
    invocationEnvelopeId:env?.id || input.invocationEnvelopeId,
    consentRequestId:env?.consentRequestId,
    gateId:env?.gateId,
    responseId:env?.responseId,
    envelopeId:env?.envelopeId,
    recommendationId:env?.recommendationId,
    actionType:env?.actionType,
    decision,
    policyChecks:checks,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"21.1", noExecution:true, noRealLlmCall:true, envelopePolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.invocationEnvelopeId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Invocation Envelope Policy Simulation: "+sim.decision,
    metadata:{ source:"phase21.1-invocation-envelope-policy", simulationId:sim.id, invocationEnvelopeId:sim.invocationEnvelopeId, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false },
  });
  return sim;
}
export function summarizeInvocationEnvelopePolicySimulations(sims:InvocationEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }

