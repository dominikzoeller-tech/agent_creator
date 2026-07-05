import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderReadinessPolicyDecision =
  | "simulation_allowed_readiness_only"
  | "blocked_missing_readiness_preflight"
  | "blocked_secret_boundary_violation"
  | "blocked_network_or_provider_call"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_operational_defaults_violation";

export interface ProviderReadinessPolicySimulation {
  id: string;
  timestamp: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ProviderReadinessPolicyDecision;
  readinessMode: "provider_invocation_readiness_preflight_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  operationalDefaults: {
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
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function preflightPath(): string { return path.join(dataDir(), "provider-invocation-readiness-preflights.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-readiness-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ProviderReadinessPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderReadinessPolicySimulations(limit=100): ProviderReadinessPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderReadinessPolicy(input:{ preflightId?: string; metadata?: Record<string, unknown> }): ProviderReadinessPolicySimulation {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const defaults=preflight?.operationalDefaults || {};
  const output=preflight?.outputContract || {};
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"readiness_preflight_exists", passed:Boolean(preflight), reason: preflight ? "Readiness Preflight gefunden." : "Readiness Preflight fehlt." });
  checks.push({ name:"readiness_mode_no_provider_call", passed:preflight?.readinessMode === "provider_invocation_readiness_preflight_no_provider_call", reason:"Readiness Mode muss no-provider-call bleiben." });
  checks.push({ name:"no_secret_values", passed:preflight?.noSecretsIncluded === true && !containsSecretValue(preflight), reason:"Preflight darf keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"network_provider_blocked", passed:preflight?.networkCallPerformed === false && preflight?.providerExecutionAllowed === false, reason:"Netzwerk- und Provider-AusfÃ¼hrung mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed:preflight?.realLlmCallAllowed === false && preflight?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed === false && preflight?.toolExecutionAllowed === false && preflight?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:preflight?.dryRunOnly === true, reason:preflight?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausfÃ¼hrend sein." });
  checks.push({ name:"operational_defaults_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Cost, RateLimit, Timeout und Observability dÃ¼rfen nur Metadata Defaults sein." });
  let decision: ProviderReadinessPolicyDecision="simulation_allowed_readiness_only";
  let reason="Provider Readiness Policy Simulation erlaubt nur Readiness/Metadata. Kein Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_readiness_preflight"; reason="Readiness Preflight nicht gefunden."; }
  else if(preflight.noSecretsIncluded !== true || containsSecretValue(preflight)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt oder Secret-Ã¤hnlicher Wert erkannt."; }
  else if(preflight.networkCallPerformed !== false || preflight.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Netzwerk-/Provider-AusfÃ¼hrung ist nicht eindeutig blockiert."; }
  else if(preflight.realLlmCallAllowed !== false || preflight.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(preflight.executionAllowed !== false || preflight.toolExecutionAllowed !== false || preflight.agentExecutionAllowed !== false || preflight.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausfÃ¼hrende Regeln."; }
  else if(checks.find((c)=>c.name==="operational_defaults_metadata_only")?.passed !== true){ decision="blocked_operational_defaults_violation"; reason="Operational Defaults verletzen Metadata-only Vorgaben."; }
  const sim: ProviderReadinessPolicySimulation={
    id:makeId("provider-readiness-policy-sim"),
    timestamp:new Date().toISOString(),
    preflightId:preflight?.id || input.preflightId,
    boundaryCheckId:preflight?.boundaryCheckId,
    adapterStubId:preflight?.adapterStubId,
    invocationEnvelopeId:preflight?.invocationEnvelopeId,
    decision,
    readinessMode:"provider_invocation_readiness_preflight_no_provider_call",
    policyChecks:checks,
    operationalDefaults:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_boundary_violation",
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"24.1", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, readinessPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.preflightId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Provider Readiness Policy Simulation: "+sim.decision,
    metadata:{ source:"phase24.1-provider-readiness-policy", simulationId:sim.id, preflightId:sim.preflightId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeProviderReadinessPolicySimulations(sims:ProviderReadinessPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

