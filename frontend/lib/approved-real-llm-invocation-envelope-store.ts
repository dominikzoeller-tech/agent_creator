import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovedInvocationEnvelopeDecision =
  | "invocation_envelope_prepared"
  | "blocked_missing_consent_request"
  | "blocked_consent_not_pending_or_approved"
  | "blocked_consent_expired"
  | "blocked_missing_human_approval_requirement"
  | "blocked_real_llm_call_already_allowed"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface ApprovedRealLlmInvocationEnvelope {
  id: string;
  timestamp: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ApprovedInvocationEnvelopeDecision;
  approvalState: {
    approvalStatus: "pending" | "approved" | "unknown";
    acceptedForEnvelopePrep: boolean;
    expiresAt?: string;
    notExpired: boolean;
  };
  envelopeChecks: Array<{ name: string; passed: boolean; reason: string }>;
  invocationEnvelope: {
    mode: "approved_invocation_envelope_prep_only";
    realLlmCallAllowed: false;
    llmCallPerformed: false;
    providerExecutionAllowed: false;
    toolExecutionAllowed: false;
    agentExecutionAllowed: false;
    outputContractLocked: true;
    auditBeforeInvocationRequired: true;
    finalSecretScanRequired: true;
  };
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
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(env: ApprovedRealLlmInvocationEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(env)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitize(value: unknown): string { return String(value || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 2000); }
function isNotExpired(value: unknown): boolean { if(typeof value !== "string" || !value) return false; const t=Date.parse(value); return Number.isFinite(t) && t > Date.now(); }
function approvalStatus(req:any): "pending" | "approved" | "unknown" { const s=req?.consentScope?.approvalStatus; return s === "approved" || s === "pending" ? s : "unknown"; }
export function listApprovedRealLlmInvocationEnvelopes(limit=100): ApprovedRealLlmInvocationEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createApprovedRealLlmInvocationEnvelope(input:{ consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedRealLlmInvocationEnvelope {
  ensureStore();
  const requests=readJsonl(consentPath());
  const req=input.consentRequestId ? requests.find((entry:any)=>entry.id===input.consentRequestId) : requests[0];
  const status=approvalStatus(req);
  const notExpired=isNotExpired(req?.consentScope?.expiresAt);
  const acceptedForEnvelopePrep=status === "pending" || status === "approved";
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"consent_request_exists", passed:Boolean(req), reason: req ? "Consent Request gefunden." : "Consent Request fehlt." });
  checks.push({ name:"approval_state_valid_for_prep", passed:acceptedForEnvelopePrep, reason:"FÃ¼r Envelope-Prep sind pending oder approved erlaubt; echte Invocation bleibt blockiert." });
  checks.push({ name:"consent_not_expired", passed:notExpired, reason:notExpired ? "Consent Request ist nicht abgelaufen." : "Consent Request ist abgelaufen oder Ablaufzeit fehlt." });
  checks.push({ name:"human_approval_required", passed:req?.humanApprovalRequired === true && req?.consentScope?.requiresExplicitHumanApproval === true, reason:"Explizite Human Approval muss weiterhin verpflichtend sein." });
  checks.push({ name:"real_llm_still_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt im Envelope blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Tool-, Agent- und Execution-Freigaben bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"final_secret_scan", passed:req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview), reason:req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview) ? "Finaler Secret Scan ohne Treffer." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_locked", passed:req?.outputContract?.outputType === "recommendation_explanation_only" && req?.outputContract?.mayExecuteTools === false && req?.outputContract?.mayExecuteAgents === false && req?.outputContract?.mayRevealSecrets === false && req?.outputContract?.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausfÃ¼hrend sein." });
  let decision: ApprovedInvocationEnvelopeDecision="invocation_envelope_prepared";
  let reason="Approved Real LLM Invocation Envelope vorbereitet. Keine Tool-/Agent-AusfÃ¼hrung und kein produktiver LLM-Aufruf.";
  if(!req){ decision="blocked_missing_consent_request"; reason="Consent Request nicht gefunden."; }
  else if(!acceptedForEnvelopePrep){ decision="blocked_consent_not_pending_or_approved"; reason="Consent Status ist nicht fÃ¼r Envelope Prep geeignet."; }
  else if(!notExpired){ decision="blocked_consent_expired"; reason="Consent Request ist abgelaufen."; }
  else if(req.humanApprovalRequired !== true || req.consentScope?.requiresExplicitHumanApproval !== true){ decision="blocked_missing_human_approval_requirement"; reason="Human Approval Requirement fehlt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_call_already_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(req.noSecretsIncluded !== true || containsSecretPattern(req.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Consent Prompt Preview erkannt."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Consent Request verletzt Execution Safety Invariants."; }
  const out=req?.outputContract || {};
  const env: ApprovedRealLlmInvocationEnvelope={
    id:makeId("approved-real-llm-envelope"),
    timestamp:new Date().toISOString(),
    consentRequestId:req?.id || input.consentRequestId,
    gateId:req?.gateId,
    responseId:req?.responseId,
    envelopeId:req?.envelopeId,
    recommendationId:req?.recommendationId,
    actionType:req?.actionType,
    decision,
    approvalState:{ approvalStatus:status, acceptedForEnvelopePrep, expiresAt:req?.consentScope?.expiresAt, notExpired },
    envelopeChecks:checks,
    invocationEnvelope:{ mode:"approved_invocation_envelope_prep_only", realLlmCallAllowed:false, llmCallPerformed:false, providerExecutionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, outputContractLocked:true, auditBeforeInvocationRequired:true, finalSecretScanRequired:true },
    promptPreview:req ? sanitize(req.promptPreview) : "",
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
    metadata:{ ...(input.metadata||{}), phase:"21.0", noExecution:true, noRealLlmCall:true, envelopePrepOnly:true },
  };
  appendEnvelope(env);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:env.id,
    status:env.decision,
    riskLevel:"high",
    summary:"Approved Real LLM Invocation Envelope: "+env.decision,
    metadata:{ source:"phase21.0-approved-real-llm-invocation-envelope", envelopeId:env.id, consentRequestId:env.consentRequestId, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false },
  });
  return env;
}
export function summarizeApprovedRealLlmInvocationEnvelopes(envs:ApprovedRealLlmInvocationEnvelope[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const env of envs){ byDecision[env.decision]=(byDecision[env.decision]||0)+1; if(env.actionType) byActionType[env.actionType]=(byActionType[env.actionType]||0)+1; } return { total:envs.length, byDecision, byActionType }; }

