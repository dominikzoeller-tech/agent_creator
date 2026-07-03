import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderStubDecision =
  | "provider_stub_prepared_no_network"
  | "blocked_missing_invocation_envelope"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation"
  | "blocked_envelope_not_prep_only";

export interface ProviderAgnosticLlmInvocationAdapterStub {
  id: string;
  timestamp: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ProviderStubDecision;
  adapterMode: "provider_agnostic_no_network_stub";
  adapterChecks: Array<{ name: string; passed: boolean; reason: string }>;
  providerRequestPreview: {
    provider: "none";
    networkCallAllowed: false;
    modelSelected: "none";
    promptPreview: string;
    outputContractType: "recommendation_explanation_only";
  };
  adapterResponsePreview: {
    responseType: "stub_only";
    text: string;
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
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
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function stubPath(): string { return path.join(dataDir(), "provider-agnostic-llm-invocation-adapter-stubs.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendStub(stub: ProviderAgnosticLlmInvocationAdapterStub): void { ensureStore(); appendFileSync(stubPath(), JSON.stringify(stub)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitize(value: unknown): string { return String(value || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 2200); }
export function listProviderAgnosticLlmInvocationAdapterStubs(limit=100): ProviderAgnosticLlmInvocationAdapterStub[] { ensureStore(); return readJsonl(stubPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderAgnosticLlmInvocationAdapterStub(input:{ invocationEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderAgnosticLlmInvocationAdapterStub {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const env=input.invocationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.invocationEnvelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"invocation_envelope_exists", passed:Boolean(env), reason: env ? "Invocation Envelope gefunden." : "Invocation Envelope fehlt." });
  checks.push({ name:"prep_only_mode", passed: env?.invocationEnvelope?.mode === "approved_invocation_envelope_prep_only", reason:"Invocation Envelope muss Prep-only sein." });
  checks.push({ name:"no_network_call", passed:true, reason:"Provider Adapter Stub erlaubt keinen Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"provider_none", passed:true, reason:"Provider ist bewusst 'none'." });
  checks.push({ name:"real_llm_blocked", passed: env?.realLlmCallAllowed === false && env?.llmCallPerformed === false && env?.invocationEnvelope?.realLlmCallAllowed === false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed: env?.executionAllowed === false && env?.toolExecutionAllowed === false && env?.agentExecutionAllowed === false && env?.invocationEnvelope?.toolExecutionAllowed === false && env?.invocationEnvelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed: env?.dryRunOnly === true, reason: env?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview), reason: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract", passed: env?.outputContract?.outputType === "recommendation_explanation_only" && env?.outputContract?.mayExecuteTools === false && env?.outputContract?.mayExecuteAgents === false && env?.outputContract?.mayRevealSecrets === false && env?.outputContract?.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend sein." });
  let decision: ProviderStubDecision="provider_stub_prepared_no_network";
  let reason="Provider-agnostischer LLM Invocation Adapter Stub vorbereitet. Kein Netzwerk-/Provider-Aufruf.";
  if(!env){ decision="blocked_missing_invocation_envelope"; reason="Invocation Envelope nicht gefunden."; }
  else if(env.invocationEnvelope?.mode !== "approved_invocation_envelope_prep_only"){ decision="blocked_envelope_not_prep_only"; reason="Invocation Envelope ist nicht Prep-only."; }
  else if(env.realLlmCallAllowed !== false || env.llmCallPerformed !== false || env.invocationEnvelope?.realLlmCallAllowed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(env.executionAllowed !== false || env.toolExecutionAllowed !== false || env.agentExecutionAllowed !== false || env.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Execution Safety Invariants."; }
  else if(env.noSecretsIncluded !== true || containsSecretPattern(env.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Provider Stub erkannt."; }
  else if(env.outputContract?.outputType !== "recommendation_explanation_only" || env.outputContract?.mayExecuteTools !== false || env.outputContract?.mayExecuteAgents !== false || env.outputContract?.mayRevealSecrets !== false || env.outputContract?.mayChangeState !== false){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  const promptPreview=env ? sanitize(env.promptPreview) : "";
  const stub: ProviderAgnosticLlmInvocationAdapterStub={
    id:makeId("provider-llm-stub"),
    timestamp:new Date().toISOString(),
    invocationEnvelopeId:env?.id || input.invocationEnvelopeId,
    consentRequestId:env?.consentRequestId,
    gateId:env?.gateId,
    responseId:env?.responseId,
    envelopeId:env?.envelopeId,
    recommendationId:env?.recommendationId,
    actionType:env?.actionType,
    decision,
    adapterMode:"provider_agnostic_no_network_stub",
    adapterChecks:checks,
    providerRequestPreview:{ provider:"none", networkCallAllowed:false, modelSelected:"none", promptPreview, outputContractType:"recommendation_explanation_only" },
    adapterResponsePreview:{ responseType:"stub_only", text:"No provider call performed. Adapter returned a dry-run stub response only." },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"22.0", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, adapterStubOnly:true },
  };
  appendStub(stub);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:stub.id,
    status:stub.decision,
    riskLevel:"high",
    summary:"Provider-agnostic LLM Invocation Adapter Stub: "+stub.decision,
    metadata:{ source:"phase22.0-provider-agnostic-llm-adapter-stub", stubId:stub.id, invocationEnvelopeId:stub.invocationEnvelopeId, networkCallPerformed:false, llmCallPerformed:false, realLlmCallAllowed:false },
  });
  return stub;
}
export function summarizeProviderAgnosticLlmInvocationAdapterStubs(stubs:ProviderAgnosticLlmInvocationAdapterStub[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const stub of stubs){ byDecision[stub.decision]=(byDecision[stub.decision]||0)+1; if(stub.actionType) byActionType[stub.actionType]=(byActionType[stub.actionType]||0)+1; } return { total:stubs.length, byDecision, byActionType }; }
