import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RealLlmCallGateDecision =
  | "gate_prepared_dry_run"
  | "blocked_missing_stub_response"
  | "blocked_execution_not_safe"
  | "blocked_llm_call_not_allowed"
  | "blocked_secret_risk"
  | "blocked_output_contract_missing";

export interface ControlledRealLlmCallGate {
  id: string;
  timestamp: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmCallGateDecision;
  gateChecks: Array<{ name: string; passed: boolean; reason: string }>;
  invocationPlan: {
    mode: "dry_run_gate_only";
    providerAllowed: false;
    realLlmCallAllowed: false;
    policyGateRequired: true;
    secretScanRequired: true;
    outputContractRequired: true;
    auditRequiredBeforeCall: true;
    auditRequiredAfterDecision: true;
  };
  sanitizedPromptPreview: string;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmCallPerformed: false;
  realLlmCallAllowed: false;
  policyGateRequired: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function responsesPath(): string { return path.join(dataDir(), "controlled-llm-stub-responses.jsonl"); }
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate: ControlledRealLlmCallGate): void { ensureStore(); appendFileSync(gatesPath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function safePreview(response:any): string { return String(response?.responseText || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1600); }
export function listControlledRealLlmCallGates(limit=100): ControlledRealLlmCallGate[] { ensureStore(); return readJsonl(gatesPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledRealLlmCallGate(input:{ responseId?: string; metadata?: Record<string, unknown> }): ControlledRealLlmCallGate {
  ensureStore();
  const responses=readJsonl(responsesPath());
  const response=input.responseId ? responses.find((entry:any)=>entry.id===input.responseId) : responses[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"stub_response_exists", passed:Boolean(response), reason: response ? "Stub Response gefunden." : "Stub Response fehlt." });
  checks.push({ name:"stub_only", passed: response?.stubOnly === true, reason: response?.stubOnly === true ? "Stub-only ist aktiv." : "Stub-only fehlt." });
  checks.push({ name:"llm_call_not_performed", passed: response?.llmCallPerformed === false, reason: response?.llmCallPerformed === false ? "Bisher kein LLM-Aufruf." : "LLM-Aufruf wurde bereits durchgefÃ¼hrt." });
  checks.push({ name:"execution_blocked", passed: response?.executionAllowed === false && response?.toolExecutionAllowed === false && response?.agentExecutionAllowed === false, reason: "Tool-, Agent- und Execution-Freigaben mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: response?.dryRunOnly === true, reason: response?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText), reason: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText) ? "Kein Secret-Muster im Stub Response Text." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_required", passed:true, reason:"Output Contract muss vor echter Invocation erneut geprÃ¼ft werden." });
  checks.push({ name:"policy_gate_required", passed:true, reason:"Policy Gate ist vor produktivem LLM-Aufruf erforderlich." });
  let decision: RealLlmCallGateDecision="gate_prepared_dry_run";
  let reason="Controlled Real LLM Call Gate vorbereitet. Phase 19.0 fÃ¼hrt keinen produktiven LLM-Aufruf aus.";
  if(!response){ decision="blocked_missing_stub_response"; reason="Stub Response nicht gefunden."; }
  else if(response.executionAllowed!==false || response.toolExecutionAllowed!==false || response.agentExecutionAllowed!==false || response.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Stub Response verletzt Execution Safety Invariants."; }
  else if(response.llmCallPerformed!==false || response.stubOnly!==true){ decision="blocked_llm_call_not_allowed"; reason="Stub Response ist nicht eindeutig no-LLM-call/stub-only."; }
  else if(response.noSecretsIncluded!==true || containsSecretPattern(response.responseText)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Real LLM Gate erkannt."; }
  const gate: ControlledRealLlmCallGate={
    id:makeId("real-llm-gate"),
    timestamp:new Date().toISOString(),
    responseId:response?.id || input.responseId,
    envelopeId:response?.envelopeId,
    recommendationId:response?.recommendationId,
    actionType:response?.actionType,
    decision,
    gateChecks:checks,
    invocationPlan:{ mode:"dry_run_gate_only", providerAllowed:false, realLlmCallAllowed:false, policyGateRequired:true, secretScanRequired:true, outputContractRequired:true, auditRequiredBeforeCall:true, auditRequiredAfterDecision:true },
    sanitizedPromptPreview: response ? safePreview(response) : "",
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmCallPerformed:false,
    realLlmCallAllowed:false,
    policyGateRequired:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"19.0", noExecution:true, noRealLlmCall:true, policyGateRequired:true },
  };
  appendGate(gate);
  return gate;
}
export function summarizeControlledRealLlmCallGates(gates:ControlledRealLlmCallGate[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; if(gate.actionType) byActionType[gate.actionType]=(byActionType[gate.actionType]||0)+1; } return { total:gates.length, byDecision, byActionType }; }

