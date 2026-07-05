import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenIssuanceGateDecision =
  | "approval_token_issuance_gate_prepared_no_provider_call"
  | "blocked_missing_approval_token_request"
  | "blocked_approval_token_not_requested"
  | "blocked_approval_token_already_issued"
  | "blocked_missing_explicit_issuance_intent"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_token"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenIssuanceGate {
  id: string;
  timestamp: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenIssuanceGateDecision;
  issuanceGateMode: "explicit_human_approval_token_issuance_gate_no_provider_call";
  issuanceChecks: Array<{ name: string; passed: boolean; reason: string }>;
  issuanceState: {
    approvalTokenRequested: true;
    approvalTokenIssuancePrepared: true;
    approvalTokenIssued: false;
    humanApproved: false;
    humanApprovalRequired: true;
    issuanceIntentRecorded: boolean;
    issuanceReason: string;
  };
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
    manualApprovalRequiredBeforeAnyExternalCall: true;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function issuanceGatePath(): string { return path.join(dataDir(), "approval-token-issuance-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendIssuanceGate(gate: ApprovalTokenIssuanceGate): void { ensureStore(); appendFileSync(issuanceGatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenIssuanceGates(limit=100): ApprovalTokenIssuanceGate[] { ensureStore(); return readJsonl(issuanceGatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createApprovalTokenIssuanceGate(input:{ approvalTokenRequestId?: string; issuanceReason?: string; issuanceIntent?: boolean; metadata?: Record<string, unknown> }): ApprovalTokenIssuanceGate {
  ensureStore();
  const requests=readJsonl(requestPath());
  const req=input.approvalTokenRequestId ? requests.find((entry:any)=>entry.id===input.approvalTokenRequestId) : requests[0];
  const approval=req?.approvalRequest || {};
  const plan=req?.providerCallPlan || {};
  const controls=req?.operationalControls || {};
  const issuanceIntentRecorded=input.issuanceIntent === true;
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"approval_token_request_exists", passed:Boolean(req), reason: req ? "Approval Token Request gefunden." : "Approval Token Request fehlt." });
  checks.push({ name:"approval_token_requested", passed:approval.approvalTokenRequested === true, reason:"Approval Token muss explizit requested sein." });
  checks.push({ name:"approval_token_not_already_issued", passed:approval.approvalTokenIssued === false, reason:"Token darf nicht bereits ausgestellt sein." });
  checks.push({ name:"human_not_implicitly_approved", passed:approval.humanApproved === false, reason:"Gate erteilt keine implizite Human Approval." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval bleibt erforderlich." });
  checks.push({ name:"issuance_intent_recorded", passed:issuanceIntentRecorded, reason:"Explizite Token-Issuance-Intent muss separat erfasst werden." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:req?.noSecretsIncluded === true && !containsSecretValue(req), reason:"Issuance Gate darf keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  checks.push({ name:"real_llm_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Token blockiert." });
  checks.push({ name:"network_provider_blocked", passed:req?.networkCallPerformed === false && req?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenIssuanceGateDecision="approval_token_issuance_gate_prepared_no_provider_call";
  let reason="Approval Token Issuance Gate vorbereitet. Token wird weiterhin nicht automatisch ausgestellt. Kein Provider-/Netzwerk-Aufruf.";
  if(!req){ decision="blocked_missing_approval_token_request"; reason="Approval Token Request nicht gefunden."; }
  else if(approval.approvalTokenRequested !== true){ decision="blocked_approval_token_not_requested"; reason="Approval Token wurde nicht requested."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(!issuanceIntentRecorded){ decision="blocked_missing_explicit_issuance_intent"; reason="Explizite Issuance Intent fehlt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || req.networkCallPerformed !== false || req.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(req.noSecretsIncluded !== true || containsSecretValue(req)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_token"; reason="Real LLM Call ist ohne Token nicht blockiert."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const gate:ApprovalTokenIssuanceGate={
    id:makeId("approval-token-issuance-gate"),
    timestamp:new Date().toISOString(),
    approvalTokenRequestId:req?.id || input.approvalTokenRequestId,
    gateId:req?.gateId,
    simulationEnvelopeId:req?.simulationEnvelopeId,
    preflightId:req?.preflightId,
    boundaryCheckId:req?.boundaryCheckId,
    adapterStubId:req?.adapterStubId,
    invocationEnvelopeId:req?.invocationEnvelopeId,
    decision,
    issuanceGateMode:"explicit_human_approval_token_issuance_gate_no_provider_call",
    issuanceChecks:checks,
    issuanceState:{ approvalTokenRequested:true, approvalTokenIssuancePrepared:true, approvalTokenIssued:false, humanApproved:false, humanApprovalRequired:true, issuanceIntentRecorded, issuanceReason:input.issuanceReason || "Token issuance gate prepared. Token not issued automatically." },
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, manualApprovalRequiredBeforeAnyExternalCall:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision !== "blocked_secret_boundary_violation",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"28.0", approvalTokenIssuancePrepared:true, approvalTokenIssued:false, humanApproved:false, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendIssuanceGate(gate);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:gate.id,
    status:gate.decision,
    riskLevel:"critical",
    summary:"Approval Token Issuance Gate: "+gate.decision,
    metadata:{ source:"phase28.0-approval-token-issuance-gate", issuanceGateId:gate.id, approvalTokenRequestId:gate.approvalTokenRequestId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return gate;
}
export function summarizeApprovalTokenIssuanceGates(gates:ApprovalTokenIssuanceGate[]){ const byDecision:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; } return { total:gates.length, byDecision }; }

