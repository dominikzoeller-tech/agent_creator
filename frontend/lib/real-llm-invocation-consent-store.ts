import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmConsentDecision =
  | "consent_request_prepared"
  | "blocked_missing_real_llm_gate"
  | "blocked_policy_gate_missing"
  | "blocked_real_llm_allowed_without_consent"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface RealLlmInvocationConsentRequest {
  id: string;
  timestamp: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmConsentDecision;
  consentScope: {
    purpose: "real_llm_invocation";
    requiresExplicitHumanApproval: true;
    approvalStatus: "pending";
    canExpire: true;
    expiresAt: string;
  };
  consentChecks: Array<{ name: string; passed: boolean; reason: string }>;
  promptPreview: string;
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  consentRequired: true;
  humanApprovalRequired: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendConsent(req: RealLlmInvocationConsentRequest): void { ensureStore(); appendFileSync(consentPath(), JSON.stringify(req)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitizedPreview(gate:any): string { return String(gate?.sanitizedPromptPreview || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1800); }
function expiresAt(): string { return new Date(Date.now() + 30 * 60 * 1000).toISOString(); }
export function listRealLlmInvocationConsentRequests(limit=100): RealLlmInvocationConsentRequest[] { ensureStore(); return readJsonl(consentPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createRealLlmInvocationConsentRequest(input:{ gateId?: string; metadata?: Record<string, unknown> }): RealLlmInvocationConsentRequest {
  ensureStore();
  const gates=readJsonl(gatesPath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"real_llm_gate_exists", passed:Boolean(gate), reason: gate ? "Real LLM Call Gate gefunden." : "Real LLM Call Gate fehlt." });
  checks.push({ name:"policy_gate_required", passed: gate?.policyGateRequired === true && gate?.invocationPlan?.policyGateRequired === true, reason: "Policy Gate muss vor Consent vorhanden sein." });
  checks.push({ name:"real_llm_not_yet_allowed", passed: gate?.realLlmCallAllowed === false, reason: gate?.realLlmCallAllowed === false ? "Real LLM Call ist noch blockiert." : "Real LLM Call wÃ¤re bereits erlaubt." });
  checks.push({ name:"llm_call_not_performed", passed: gate?.llmCallPerformed === false, reason: gate?.llmCallPerformed === false ? "Kein LLM-Aufruf erfolgt." : "LLM-Aufruf wurde bereits durchgefÃ¼hrt." });
  checks.push({ name:"execution_blocked", passed: gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason: "Tool-, Agent- und Execution-Freigaben mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan_before_consent", passed: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview), reason: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview) ? "Kein Secret-Risiko vor Consent." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_before_consent", passed:true, reason:"Output Contract wird vor Consent fixiert." });
  let decision: RealLlmConsentDecision="consent_request_prepared";
  let reason="Real LLM Invocation Consent Request vorbereitet. Kein produktiver LLM-Aufruf, Approval pending.";
  if(!gate){ decision="blocked_missing_real_llm_gate"; reason="Real LLM Call Gate nicht gefunden."; }
  else if(gate.policyGateRequired !== true || gate.invocationPlan?.policyGateRequired !== true){ decision="blocked_policy_gate_missing"; reason="Policy Gate fehlt vor Consent."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_consent"; reason="Real LLM Call ist nicht eindeutig vor Consent blockiert."; }
  else if(gate.noSecretsIncluded !== true || containsSecretPattern(gate.sanitizedPromptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Consent erkannt."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Gate verletzt Execution Safety Invariants."; }
  const req: RealLlmInvocationConsentRequest={
    id:makeId("real-llm-consent"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    responseId:gate?.responseId,
    envelopeId:gate?.envelopeId,
    recommendationId:gate?.recommendationId,
    actionType:gate?.actionType,
    decision,
    consentScope:{ purpose:"real_llm_invocation", requiresExplicitHumanApproval:true, approvalStatus:"pending", canExpire:true, expiresAt:expiresAt() },
    consentChecks:checks,
    promptPreview: gate ? sanitizedPreview(gate) : "",
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"20.0", noExecution:true, noRealLlmCall:true, humanApprovalRequired:true },
  };
  appendConsent(req);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:req.id,
    status:req.decision,
    riskLevel:"high",
    summary:"Real LLM Invocation Consent Request: "+req.decision,
    metadata:{ source:"phase20.0-real-llm-invocation-consent", consentRequestId:req.id, gateId:req.gateId, realLlmCallAllowed:false, llmCallPerformed:false, humanApprovalRequired:true },
  });
  return req;
}
export function summarizeRealLlmInvocationConsentRequests(reqs:RealLlmInvocationConsentRequest[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const req of reqs){ byDecision[req.decision]=(byDecision[req.decision]||0)+1; if(req.actionType) byActionType[req.actionType]=(byActionType[req.actionType]||0)+1; } return { total:reqs.length, byDecision, byActionType }; }

