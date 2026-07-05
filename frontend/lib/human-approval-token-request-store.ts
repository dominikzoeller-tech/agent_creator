import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type HumanApprovalTokenRequestDecision =
  | "approval_token_request_recorded_no_provider_call"
  | "blocked_missing_real_provider_gate"
  | "blocked_human_approval_not_required"
  | "blocked_human_already_approved"
  | "blocked_approval_token_already_issued"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface HumanApprovalTokenRequest {
  id: string;
  timestamp: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: HumanApprovalTokenRequestDecision;
  requestMode: "explicit_human_approval_token_request_no_provider_call";
  requestChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalRequest: {
    humanApprovalRequired: true;
    humanApproved: false;
    approvalTokenRequested: true;
    approvalTokenIssued: false;
    approvalTokenId?: string;
    approvalReason: string;
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
function gatePath(): string { return path.join(dataDir(), "controlled-real-provider-invocation-gates.jsonl"); }
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendRequest(req: HumanApprovalTokenRequest): void { ensureStore(); appendFileSync(requestPath(), JSON.stringify(req)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listHumanApprovalTokenRequests(limit=100): HumanApprovalTokenRequest[] { ensureStore(); return readJsonl(requestPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createHumanApprovalTokenRequest(input:{ gateId?: string; approvalReason?: string; metadata?: Record<string, unknown> }): HumanApprovalTokenRequest {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const approval=gate?.approvalState || {};
  const plan=gate?.providerCallPlan || {};
  const controls=gate?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"real_provider_gate_exists", passed:Boolean(gate), reason: gate ? "Real Provider Gate gefunden." : "Real Provider Gate fehlt." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval muss vor echtem externen Call zwingend erforderlich sein." });
  checks.push({ name:"human_not_approved_yet", passed:approval.humanApproved === false, reason:"Approval Request darf noch keine Approval erteilen." });
  checks.push({ name:"approval_token_not_issued", passed:approval.approvalTokenIssued === false, reason:"Approval Token darf noch nicht automatisch erteilt sein." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Gate und Request dÃ¼rfen keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:HumanApprovalTokenRequestDecision="approval_token_request_recorded_no_provider_call";
  let reason="Human Approval Token Request erfasst. Approval Token wird nicht automatisch erteilt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_real_provider_gate"; reason="Real Provider Gate nicht gefunden."; }
  else if(approval.humanApprovalRequired !== true){ decision="blocked_human_approval_not_required"; reason="Human Approval ist nicht zwingend erforderlich."; }
  else if(approval.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Gate ist bereits approved."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Automatischer Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne Approval nicht blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const req:HumanApprovalTokenRequest={
    id:makeId("human-approval-token-request"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    simulationEnvelopeId:gate?.simulationEnvelopeId,
    preflightId:gate?.preflightId,
    boundaryCheckId:gate?.boundaryCheckId,
    adapterStubId:gate?.adapterStubId,
    invocationEnvelopeId:gate?.invocationEnvelopeId,
    decision,
    requestMode:"explicit_human_approval_token_request_no_provider_call",
    requestChecks:checks,
    approvalRequest:{ humanApprovalRequired:true, humanApproved:false, approvalTokenRequested:true, approvalTokenIssued:false, approvalReason:input.approvalReason || "Manual approval requested for future real provider invocation. Token not issued automatically." },
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
    metadata:{ ...(input.metadata||{}), phase:"27.0", approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendRequest(req);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:req.id,
    status:req.decision,
    riskLevel:"critical",
    summary:"Human Approval Token Request: "+req.decision,
    metadata:{ source:"phase27.0-human-approval-token-request", requestId:req.id, gateId:req.gateId, approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return req;
}
export function summarizeHumanApprovalTokenRequests(requests:HumanApprovalTokenRequest[]){ const byDecision:Record<string,number>={}; for(const req of requests){ byDecision[req.decision]=(byDecision[req.decision]||0)+1; } return { total:requests.length, byDecision }; }

