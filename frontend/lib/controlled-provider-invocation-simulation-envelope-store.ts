import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledProviderInvocationSimulationDecision =
  | "simulation_envelope_prepared_no_external_call"
  | "blocked_missing_readiness_preflight"
  | "blocked_secret_boundary_violation"
  | "blocked_network_or_provider_call"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation";

export interface ControlledProviderInvocationSimulationEnvelope {
  id: string;
  timestamp: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledProviderInvocationSimulationDecision;
  simulationMode: "controlled_provider_invocation_simulation_envelope_no_external_call";
  simulationChecks: Array<{ name: string; passed: boolean; reason: string }>;
  simulatedProviderRequest: {
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    promptIncluded: false;
    secretValuesIncluded: false;
    outputContractType: "recommendation_explanation_only";
  };
  simulatedProviderResponse: {
    responseType: "metadata_only_simulated_response";
    text: string;
    tokenUsageEstimated: false;
    costEstimated: false;
  };
  operationalMetadata: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
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
function preflightPath(): string { return path.join(dataDir(), "provider-invocation-readiness-preflights.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(env: ControlledProviderInvocationSimulationEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(env)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledProviderInvocationSimulationEnvelopes(limit=100): ControlledProviderInvocationSimulationEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledProviderInvocationSimulationEnvelope(input:{ preflightId?: string; metadata?: Record<string, unknown> }): ControlledProviderInvocationSimulationEnvelope {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const output=preflight?.outputContract || {};
  const defaults=preflight?.operationalDefaults || {};
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"readiness_preflight_exists", passed:Boolean(preflight), reason: preflight ? "Readiness Preflight gefunden." : "Readiness Preflight fehlt." });
  checks.push({ name:"readiness_preflight_no_provider_call", passed:preflight?.readinessMode === "provider_invocation_readiness_preflight_no_provider_call", reason:"Readiness Preflight muss no-provider-call bleiben." });
  checks.push({ name:"no_secret_values", passed:preflight?.noSecretsIncluded === true && !containsSecretValue(preflight), reason:"Keine Secret-Werte oder Secret-ähnlichen Werte dürfen enthalten sein." });
  checks.push({ name:"no_network_or_provider_call", passed:preflight?.networkCallPerformed === false && preflight?.providerExecutionAllowed === false, reason:"Provider-/Netzwerk-Aufruf muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed:preflight?.realLlmCallAllowed === false && preflight?.llmCallPerformed === false, reason:"Produktiver LLM-Aufruf muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed === false && preflight?.toolExecutionAllowed === false && preflight?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:preflight?.dryRunOnly === true, reason:preflight?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend bleiben." });
  checks.push({ name:"operational_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Defaults müssen metadata-only bleiben." });
  let decision: ControlledProviderInvocationSimulationDecision="simulation_envelope_prepared_no_external_call";
  let reason="Controlled Provider Invocation Simulation Envelope vorbereitet. Kein externer Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_readiness_preflight"; reason="Readiness Preflight nicht gefunden."; }
  else if(preflight.noSecretsIncluded !== true || containsSecretValue(preflight)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt oder Secret-ähnlicher Wert erkannt."; }
  else if(preflight.networkCallPerformed !== false || preflight.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Provider-/Netzwerk-Ausführung ist nicht eindeutig blockiert."; }
  else if(preflight.realLlmCallAllowed !== false || preflight.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Produktiver LLM-Aufruf ist nicht eindeutig blockiert."; }
  else if(preflight.executionAllowed !== false || preflight.toolExecutionAllowed !== false || preflight.agentExecutionAllowed !== false || preflight.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  const env: ControlledProviderInvocationSimulationEnvelope={
    id:makeId("provider-simulation-envelope"),
    timestamp:new Date().toISOString(),
    preflightId:preflight?.id || input.preflightId,
    boundaryCheckId:preflight?.boundaryCheckId,
    adapterStubId:preflight?.adapterStubId,
    invocationEnvelopeId:preflight?.invocationEnvelopeId,
    decision,
    simulationMode:"controlled_provider_invocation_simulation_envelope_no_external_call",
    simulationChecks:checks,
    simulatedProviderRequest:{ provider:"none", modelSelected:"none", networkCallAllowed:false, promptIncluded:false, secretValuesIncluded:false, outputContractType:"recommendation_explanation_only" },
    simulatedProviderResponse:{ responseType:"metadata_only_simulated_response", text:"No external provider call performed. This is a controlled metadata-only simulation envelope.", tokenUsageEstimated:false, costEstimated:false },
    operationalMetadata:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_boundary_violation",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"25.0", noExternalCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, simulationEnvelopeOnly:true },
  };
  appendEnvelope(env);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:env.id,
    status:env.decision,
    riskLevel:"high",
    summary:"Controlled Provider Invocation Simulation Envelope: "+env.decision,
    metadata:{ source:"phase25.0-controlled-provider-invocation-simulation-envelope", simulationEnvelopeId:env.id, preflightId:env.preflightId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return env;
}
export function summarizeControlledProviderInvocationSimulationEnvelopes(envelopes:ControlledProviderInvocationSimulationEnvelope[]){ const byDecision:Record<string,number>={}; for(const env of envelopes){ byDecision[env.decision]=(byDecision[env.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
