import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledProviderSimulationPolicyDecision =
  | "simulation_allowed_metadata_only"
  | "blocked_missing_simulation_envelope"
  | "blocked_external_call_risk"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_response_contract_violation";

export interface ControlledProviderSimulationPolicySimulation {
  id: string;
  timestamp: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledProviderSimulationPolicyDecision;
  simulationMode: "controlled_provider_invocation_simulation_envelope_no_external_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
function envelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ControlledProviderSimulationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledProviderSimulationPolicySimulations(limit=100): ControlledProviderSimulationPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateControlledProviderSimulationPolicy(input:{ simulationEnvelopeId?: string; metadata?: Record<string, unknown> }): ControlledProviderSimulationPolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.simulationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.simulationEnvelopeId) : envelopes[0];
  const request=envelope?.simulatedProviderRequest || {};
  const response=envelope?.simulatedProviderResponse || {};
  const output=envelope?.outputContract || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"simulation_envelope_exists", passed:Boolean(envelope), reason: envelope ? "Simulation Envelope gefunden." : "Simulation Envelope fehlt." });
  checks.push({ name:"simulation_mode_no_external_call", passed:envelope?.simulationMode === "controlled_provider_invocation_simulation_envelope_no_external_call", reason:"Simulation muss no-external-call bleiben." });
  checks.push({ name:"provider_none", passed:request.provider === "none" && request.modelSelected === "none", reason:"Provider und Modell müssen none bleiben." });
  checks.push({ name:"network_blocked", passed:request.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung muss blockiert bleiben." });
  checks.push({ name:"prompt_and_secrets_excluded", passed:request.promptIncluded === false && request.secretValuesIncluded === false && envelope?.noSecretsIncluded === true && !containsSecretValue(envelope), reason:"Prompt und Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"response_metadata_only", passed:response.responseType === "metadata_only_simulated_response" && response.tokenUsageEstimated === false && response.costEstimated === false, reason:"Response muss simuliert und metadata-only sein." });
  checks.push({ name:"real_llm_blocked", passed:envelope?.realLlmCallAllowed === false && envelope?.llmCallPerformed === false, reason:"Produktiver LLM-Aufruf muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:envelope?.dryRunOnly === true, reason:envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend bleiben." });
  let decision:ControlledProviderSimulationPolicyDecision="simulation_allowed_metadata_only";
  let reason="Provider Simulation Policy erlaubt nur metadata-only Simulation. Kein externer Provider-/Netzwerk-Aufruf.";
  if(!envelope){ decision="blocked_missing_simulation_envelope"; reason="Simulation Envelope nicht gefunden."; }
  else if(request.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || request.provider !== "none" || request.modelSelected !== "none"){ decision="blocked_external_call_risk"; reason="External-Call-Risiko erkannt."; }
  else if(envelope.noSecretsIncluded !== true || request.promptIncluded !== false || request.secretValuesIncluded !== false || containsSecretValue(envelope)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(envelope.realLlmCallAllowed !== false || envelope.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Produktiver LLM-Aufruf ist nicht eindeutig blockiert."; }
  else if(envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="response_metadata_only")?.passed !== true){ decision="blocked_response_contract_violation"; reason="Response Contract ist nicht metadata-only."; }
  const sim:ControlledProviderSimulationPolicySimulation={
    id:makeId("provider-simulation-policy-sim"),
    timestamp:new Date().toISOString(),
    simulationEnvelopeId:envelope?.id || input.simulationEnvelopeId,
    preflightId:envelope?.preflightId,
    boundaryCheckId:envelope?.boundaryCheckId,
    adapterStubId:envelope?.adapterStubId,
    invocationEnvelopeId:envelope?.invocationEnvelopeId,
    decision,
    simulationMode:"controlled_provider_invocation_simulation_envelope_no_external_call",
    policyChecks:checks,
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
    metadata:{ ...(input.metadata||{}), phase:"25.1", noExternalCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, simulationPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.simulationEnvelopeId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Controlled Provider Simulation Policy: "+sim.decision,
    metadata:{ source:"phase25.1-provider-simulation-policy", simulationId:sim.id, simulationEnvelopeId:sim.simulationEnvelopeId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeControlledProviderSimulationPolicySimulations(sims:ControlledProviderSimulationPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
