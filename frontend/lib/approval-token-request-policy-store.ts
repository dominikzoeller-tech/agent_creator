import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenRequestPolicyDecision =
  | "approval_token_request_policy_allowed_no_token_issued"
  | "blocked_missing_approval_token_request"
  | "blocked_approval_token_not_requested"
  | "blocked_approval_token_issued"
  | "blocked_human_already_approved"
  | "blocked_human_approval_not_required"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenRequestPolicySimulation {
  id: string;
  timestamp: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenRequestPolicyDecision;
  requestMode: "explicit_human_approval_token_request_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssued: false;
  humanApprovalRequired: true;
  humanApproved: false;
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
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-request-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenRequestPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenRequestPolicySimulations(limit=100): ApprovalTokenRequestPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenRequestPolicy(input:{ approvalTokenRequestId?: string; metadata?: Record<string, unknown> }): ApprovalTokenRequestPolicySimulation {
  ensureStore();
  const requests=readJsonl(requestPath());
  const req=input.approvalTokenRequestId ? requests.find((entry:any)=>entry.id===input.approvalTokenRequestId) : requests[0];
  const approval=req?.approvalRequest || {};
  const plan=req?.providerCallPlan || {};
  const controls=req?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"approval_token_request_exists", passed:Boolean(req), reason: req ? "Approval Token Request gefunden." : "Approval Token Request fehlt." });
  checks.push({ name:"request_mode_no_provider_call", passed:req?.requestMode === "explicit_human_approval_token_request_no_provider_call", reason:"Request Mode muss no-provider-call bleiben." });
  checks.push({ name:"approval_token_requested", passed:approval.approvalTokenRequested === true, reason:"Approval Token Request muss explizit erfasst sein." });
  checks.push({ name:"approval_token_not_issued", passed:approval.approvalTokenIssued === false, reason:"Approval Token darf weiterhin nicht automatisch erteilt sein." });
  checks.push({ name:"human_not_approved", passed:approval.humanApproved === false, reason:"Human Approval darf durch Policy Simulation nicht erteilt werden." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval muss weiterhin zwingend erforderlich sein." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf muss blockiert bleiben." });
  checks.push({ name:"secret_boundary", passed:req?.noSecretsIncluded === true && !containsSecretValue(req), reason:"Approval Token Request darf keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls mÃ¼ssen Metadata-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"network_provider_blocked", passed:req?.networkCallPerformed === false && req?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenRequestPolicyDecision="approval_token_request_policy_allowed_no_token_issued";
  let reason="Approval Token Request Policy erlaubt nur Request/Audit-Zustand. Token bleibt nicht erteilt. Kein Provider-/Netzwerk-Aufruf.";
  if(!req){ decision="blocked_missing_approval_token_request"; reason="Approval Token Request nicht gefunden."; }
  else if(approval.approvalTokenRequested !== true){ decision="blocked_approval_token_not_requested"; reason="Approval Token wurde nicht explizit requested."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(approval.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Human Approval ist bereits erteilt."; }
  else if(approval.humanApprovalRequired !== true){ decision="blocked_human_approval_not_required"; reason="Human Approval ist nicht zwingend erforderlich."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || req.networkCallPerformed !== false || req.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-Auswahl oder externer Call ist nicht eindeutig blockiert."; }
  else if(req.noSecretsIncluded !== true || containsSecretValue(req)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne Approval nicht blockiert."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const sim:ApprovalTokenRequestPolicySimulation={
    id:makeId("approval-token-request-policy-sim"),
    timestamp:new Date().toISOString(),
    approvalTokenRequestId:req?.id || input.approvalTokenRequestId,
    gateId:req?.gateId,
    simulationEnvelopeId:req?.simulationEnvelopeId,
    preflightId:req?.preflightId,
    boundaryCheckId:req?.boundaryCheckId,
    adapterStubId:req?.adapterStubId,
    invocationEnvelopeId:req?.invocationEnvelopeId,
    decision,
    requestMode:"explicit_human_approval_token_request_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssued:false,
    humanApprovalRequired:true,
    humanApproved:false,
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
    metadata:{ ...(input.metadata||{}), phase:"27.1", approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, approvalRequestPolicyOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.approvalTokenRequestId,
    status:sim.decision,
    riskLevel:"critical",
    summary:"Approval Token Request Policy Simulation: "+sim.decision,
    metadata:{ source:"phase27.1-approval-token-request-policy", simulationId:sim.id, approvalTokenRequestId:sim.approvalTokenRequestId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeApprovalTokenRequestPolicySimulations(sims:ApprovalTokenRequestPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

