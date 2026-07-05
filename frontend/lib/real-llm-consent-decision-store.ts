import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmConsentSimulationDecision =
  | "consent_decision_simulated_pending"
  | "blocked_missing_consent_request"
  | "blocked_not_pending"
  | "blocked_real_llm_allowed"
  | "blocked_missing_human_approval_requirement"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface RealLlmConsentDecisionSimulation {
  id: string;
  timestamp: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmConsentSimulationDecision;
  simulatedDecision: "pending_review_only";
  decisionChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "real-llm-consent-decision-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: RealLlmConsentDecisionSimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listRealLlmConsentDecisionSimulations(limit=100): RealLlmConsentDecisionSimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateRealLlmConsentDecision(input:{ consentRequestId?: string; metadata?: Record<string, unknown> }): RealLlmConsentDecisionSimulation {
  ensureStore();
  const requests=readJsonl(consentPath());
  const req=input.consentRequestId ? requests.find((entry:any)=>entry.id===input.consentRequestId) : requests[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"consent_request_exists", passed:Boolean(req), reason: req ? "Consent Request gefunden." : "Consent Request fehlt." });
  checks.push({ name:"approval_pending", passed: req?.consentScope?.approvalStatus === "pending", reason: req?.consentScope?.approvalStatus === "pending" ? "Approval ist pending." : "Approval ist nicht pending." });
  checks.push({ name:"explicit_human_approval_required", passed: req?.humanApprovalRequired === true && req?.consentScope?.requiresExplicitHumanApproval === true, reason: "Explizite Human Approval muss verpflichtend sein." });
  checks.push({ name:"consent_required", passed: req?.consentRequired === true, reason: req?.consentRequired === true ? "Consent ist verpflichtend." : "Consent fehlt." });
  checks.push({ name:"real_llm_still_blocked", passed: req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason: "Real LLM Call muss vor expliziter Freigabe blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason: "Execution-, Tool- und Agent-AusfÃ¼hrung mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: req?.dryRunOnly === true, reason: req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"no_secret_risk", passed: req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview), reason: req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  let decision: RealLlmConsentSimulationDecision="consent_decision_simulated_pending";
  let reason="Consent Decision Simulation hÃ¤lt den Request im Pending Review. Kein produktiver LLM-Aufruf.";
  if(!req){ decision="blocked_missing_consent_request"; reason="Consent Request nicht gefunden."; }
  else if(req.consentScope?.approvalStatus !== "pending"){ decision="blocked_not_pending"; reason="Consent Request ist nicht pending."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist vor expliziter Approval nicht eindeutig blockiert."; }
  else if(req.humanApprovalRequired !== true || req.consentScope?.requiresExplicitHumanApproval !== true){ decision="blocked_missing_human_approval_requirement"; reason="Explizite Human Approval fehlt."; }
  else if(req.noSecretsIncluded !== true || containsSecretPattern(req.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Consent Decision erkannt."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Consent Request verletzt Execution Safety Invariants."; }
  const sim: RealLlmConsentDecisionSimulation={
    id:makeId("real-llm-consent-decision-sim"),
    timestamp:new Date().toISOString(),
    consentRequestId:req?.id || input.consentRequestId,
    gateId:req?.gateId,
    responseId:req?.responseId,
    envelopeId:req?.envelopeId,
    recommendationId:req?.recommendationId,
    actionType:req?.actionType,
    decision,
    simulatedDecision:"pending_review_only",
    decisionChecks:checks,
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
    metadata:{ ...(input.metadata||{}), phase:"20.1", noExecution:true, noRealLlmCall:true, pendingReviewOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.consentRequestId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Real LLM Consent Decision Simulation: "+sim.decision,
    metadata:{ source:"phase20.1-real-llm-consent-decision", simulationId:sim.id, consentRequestId:sim.consentRequestId, realLlmCallAllowed:false, llmCallPerformed:false, humanApprovalRequired:true },
  });
  return sim;
}
export function summarizeRealLlmConsentDecisionSimulations(sims:RealLlmConsentDecisionSimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }

