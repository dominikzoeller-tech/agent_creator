import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenIssuancePolicyDecision =
  | "approval_token_issuance_policy_allowed_no_token_issued"
  | "blocked_missing_issuance_gate"
  | "blocked_issuance_intent_missing"
  | "blocked_token_not_prepared"
  | "blocked_token_already_issued"
  | "blocked_human_already_approved"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_token"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenIssuancePolicySimulation {
  id: string;
  timestamp: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenIssuancePolicyDecision;
  issuanceGateMode: "explicit_human_approval_token_issuance_gate_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssuancePrepared: true;
  approvalTokenIssued: false;
  humanApproved: false;
  humanApprovalRequired: true;
  issuanceIntentRecorded: boolean;
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
function issuanceGatePath(): string { return path.join(dataDir(), "approval-token-issuance-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-issuance-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenIssuancePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenIssuancePolicySimulations(limit=100): ApprovalTokenIssuancePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenIssuancePolicy(input:{ issuanceGateId?: string; metadata?: Record<string, unknown> }): ApprovalTokenIssuancePolicySimulation {
  ensureStore();
  const gates=readJsonl(issuanceGatePath());
  const gate=input.issuanceGateId ? gates.find((entry:any)=>entry.id===input.issuanceGateId) : gates[0];
  const state=gate?.issuanceState || {};
  const plan=gate?.providerCallPlan || {};
  const controls=gate?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"issuance_gate_exists", passed:Boolean(gate), reason: gate ? "Approval Token Issuance Gate gefunden." : "Approval Token Issuance Gate fehlt." });
  checks.push({ name:"issuance_gate_mode_no_provider_call", passed:gate?.issuanceGateMode === "explicit_human_approval_token_issuance_gate_no_provider_call", reason:"Issuance Gate muss no-provider-call bleiben." });
  checks.push({ name:"approval_token_requested", passed:state.approvalTokenRequested === true, reason:"Approval Token muss requested sein." });
  checks.push({ name:"issuance_prepared", passed:state.approvalTokenIssuancePrepared === true, reason:"Token Issuance muss vorbereitet sein." });
  checks.push({ name:"issuance_intent_recorded", passed:state.issuanceIntentRecorded === true, reason:"Explizite Issuance Intent muss vorhanden sein." });
  checks.push({ name:"token_not_issued", passed:state.approvalTokenIssued === false, reason:"Policy Simulation darf Token nicht ausstellen." });
  checks.push({ name:"human_not_approved", passed:state.humanApproved === false, reason:"Policy Simulation darf Human Approval nicht erteilen." });
  checks.push({ name:"human_approval_required", passed:state.humanApprovalRequired === true, reason:"Human Approval bleibt erforderlich." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Issuance Policy darf keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls mÃ¼ssen Metadata-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Token blockiert." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallPerformed === false && gate?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:gate?.dryRunOnly === true, reason:gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenIssuancePolicyDecision="approval_token_issuance_policy_allowed_no_token_issued";
  let reason="Approval Token Issuance Policy erlaubt nur kontrollierte Policy Simulation. Token bleibt nicht ausgestellt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_issuance_gate"; reason="Approval Token Issuance Gate nicht gefunden."; }
  else if(state.issuanceIntentRecorded !== true){ decision="blocked_issuance_intent_missing"; reason="Explizite Issuance Intent fehlt."; }
  else if(state.approvalTokenIssuancePrepared !== true){ decision="blocked_token_not_prepared"; reason="Approval Token Issuance ist nicht vorbereitet."; }
  else if(state.approvalTokenIssued !== false){ decision="blocked_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(state.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Human Approval ist bereits erteilt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_token"; reason="Real LLM Call ist ohne Token nicht blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const sim:ApprovalTokenIssuancePolicySimulation={
    id:makeId("approval-token-issuance-policy-sim"),
    timestamp:new Date().toISOString(),
    issuanceGateId:gate?.id || input.issuanceGateId,
    approvalTokenRequestId:gate?.approvalTokenRequestId,
    gateId:gate?.gateId,
    simulationEnvelopeId:gate?.simulationEnvelopeId,
    preflightId:gate?.preflightId,
    boundaryCheckId:gate?.boundaryCheckId,
    adapterStubId:gate?.adapterStubId,
    invocationEnvelopeId:gate?.invocationEnvelopeId,
    decision,
    issuanceGateMode:"explicit_human_approval_token_issuance_gate_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssuancePrepared:true,
    approvalTokenIssued:false,
    humanApproved:false,
    humanApprovalRequired:true,
    issuanceIntentRecorded:state.issuanceIntentRecorded === true,
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
    metadata:{ ...(input.metadata||{}), phase:"28.1", approvalTokenIssuancePolicyOnly:true, approvalTokenIssued:false, humanApproved:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.issuanceGateId,
    status:sim.decision,
    riskLevel:"critical",
    summary:"Approval Token Issuance Policy Simulation: "+sim.decision,
    metadata:{ source:"phase28.1-approval-token-issuance-policy", simulationId:sim.id, issuanceGateId:sim.issuanceGateId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeApprovalTokenIssuancePolicySimulations(sims:ApprovalTokenIssuancePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

