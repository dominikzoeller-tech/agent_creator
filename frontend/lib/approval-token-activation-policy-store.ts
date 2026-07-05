import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenActivationPolicyDecision =
  | "approval_token_activation_policy_allowed_no_activation"
  | "blocked_missing_activation_gate"
  | "blocked_activation_intent_missing"
  | "blocked_token_already_active"
  | "blocked_auto_activation_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_provider_call_attempt"
  | "blocked_execution_not_safe";

export interface ApprovalTokenActivationPolicySimulation {
  id: string;
  timestamp: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: ApprovalTokenActivationPolicyDecision;
  activationGateMode: "explicit_human_approval_token_activation_gate_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssuancePrepared: true;
  approvalTokenIssued: boolean;
  tokenActivationPrepared: true;
  tokenActive: false;
  activationIntentRecorded: boolean;
  humanApproved: boolean;
  humanApprovalRequired: true;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function activationGatePath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-activation-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenActivationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenActivationPolicySimulations(limit=100): ApprovalTokenActivationPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenActivationPolicy(input:{ activationGateId?: string; metadata?: Record<string, unknown> }): ApprovalTokenActivationPolicySimulation {
  ensureStore();
  const gates=readJsonl(activationGatePath());
  const gate=input.activationGateId ? gates.find((entry:any)=>entry.id===input.activationGateId) : gates[0];
  const state=gate?.activationState || {};
  const plan=gate?.providerCallPlan || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"activation_gate_exists", passed:Boolean(gate), reason:gate?"Approval Token Activation Gate gefunden.":"Approval Token Activation Gate fehlt." });
  checks.push({ name:"activation_gate_mode_no_provider_call", passed:gate?.activationGateMode === "explicit_human_approval_token_activation_gate_no_provider_call", reason:"Activation Gate muss No-Provider-Call bleiben." });
  checks.push({ name:"activation_intent_recorded", passed:state.activationIntentRecorded === true, reason:"Activation Intent muss explizit vorhanden sein." });
  checks.push({ name:"activation_prepared", passed:state.tokenActivationPrepared === true, reason:"Activation muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:state.tokenActive === false, reason:"Policy Simulation darf den Token nicht aktivieren." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Policy darf keine Secret-Werte enthalten." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallPerformed === false && gate?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false && gate?.dryRunOnly === true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ApprovalTokenActivationPolicyDecision="approval_token_activation_policy_allowed_no_activation";
  let reason="Approval Token Activation Policy erlaubt nur Simulation. Token bleibt nicht aktiv. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_activation_gate"; reason="Approval Token Activation Gate nicht gefunden."; }
  else if(state.activationIntentRecorded !== true){ decision="blocked_activation_intent_missing"; reason="Explizite Activation Intent fehlt."; }
  else if(state.tokenActive !== false){ decision="blocked_token_already_active"; reason="Token ist bereits aktiv oder Status ist nicht false."; }
  else if(gate.tokenActive !== false){ decision="blocked_auto_activation_attempt"; reason="Auto-Aktivierung erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ApprovalTokenActivationPolicySimulation={
    id:makeId("approval-token-activation-policy-sim"),
    timestamp:new Date().toISOString(),
    activationGateId:gate?.id || input.activationGateId,
    issuanceGateId:gate?.issuanceGateId,
    approvalTokenRequestId:gate?.approvalTokenRequestId,
    decision,
    activationGateMode:"explicit_human_approval_token_activation_gate_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssuancePrepared:true,
    approvalTokenIssued:state.approvalTokenIssued === true,
    tokenActivationPrepared:true,
    tokenActive:false,
    activationIntentRecorded:state.activationIntentRecorded === true,
    humanApproved:state.humanApproved === true,
    humanApprovalRequired:true,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision !== "blocked_secret_boundary_violation",
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"29.1", approvalTokenActivationPolicyOnly:true, tokenActive:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.activationGateId, status:sim.decision, riskLevel:"critical", summary:"Approval Token Activation Policy Simulation: "+sim.decision, metadata:{ source:"phase29.1-approval-token-activation-policy", simulationId:sim.id, activationGateId:sim.activationGateId, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeApprovalTokenActivationPolicySimulations(sims:ApprovalTokenActivationPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
