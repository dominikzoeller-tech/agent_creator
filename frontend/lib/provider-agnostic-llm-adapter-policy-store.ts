import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderAdapterPolicyDecision =
  | "simulation_allowed_stub_only"
  | "blocked_missing_provider_stub"
  | "blocked_network_call_detected"
  | "blocked_provider_execution_allowed"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation";

export interface ProviderAdapterPolicySimulation {
  id: string;
  timestamp: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ProviderAdapterPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  adapterMode: "provider_agnostic_no_network_stub";
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function stubPath(): string { return path.join(dataDir(), "provider-agnostic-llm-invocation-adapter-stubs.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-agnostic-llm-adapter-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ProviderAdapterPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listProviderAdapterPolicySimulations(limit=100): ProviderAdapterPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderAdapterPolicy(input:{ adapterStubId?: string; metadata?: Record<string, unknown> }): ProviderAdapterPolicySimulation {
  ensureStore();
  const stubs=readJsonl(stubPath());
  const stub=input.adapterStubId ? stubs.find((entry:any)=>entry.id===input.adapterStubId) : stubs[0];
  const promptPreview=stub?.providerRequestPreview?.promptPreview;
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"provider_stub_exists", passed:Boolean(stub), reason: stub ? "Provider Adapter Stub gefunden." : "Provider Adapter Stub fehlt." });
  checks.push({ name:"adapter_stub_only", passed: stub?.adapterMode === "provider_agnostic_no_network_stub" && stub?.adapterResponsePreview?.responseType === "stub_only", reason:"Adapter muss provider-agnostic no-network stub-only sein." });
  checks.push({ name:"network_not_performed", passed: stub?.networkCallPerformed === false && stub?.providerRequestPreview?.networkCallAllowed === false, reason:"Netzwerk-/Provider-Aufruf muss blockiert bleiben." });
  checks.push({ name:"provider_none", passed: stub?.providerRequestPreview?.provider === "none" && stub?.providerRequestPreview?.modelSelected === "none", reason:"Kein Provider und kein Modell dürfen ausgewählt sein." });
  checks.push({ name:"provider_execution_blocked", passed: stub?.providerExecutionAllowed === false, reason:"Provider Execution muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed: stub?.realLlmCallAllowed === false && stub?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: stub?.executionAllowed === false && stub?.toolExecutionAllowed === false && stub?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: stub?.dryRunOnly === true, reason: stub?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: stub?.noSecretsIncluded === true && !containsSecretPattern(promptPreview), reason: stub?.noSecretsIncluded === true && !containsSecretPattern(promptPreview) ? "Kein Secret-Risiko im Provider Request Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract", passed: stub?.providerRequestPreview?.outputContractType === "recommendation_explanation_only", reason:"Output Contract muss recommendation_explanation_only bleiben." });
  let decision: ProviderAdapterPolicyDecision="simulation_allowed_stub_only";
  let reason="Provider Adapter Policy Simulation erlaubt nur Stub/no-network. Kein produktiver LLM-Aufruf.";
  if(!stub){ decision="blocked_missing_provider_stub"; reason="Provider Adapter Stub nicht gefunden."; }
  else if(stub.networkCallPerformed !== false || stub.providerRequestPreview?.networkCallAllowed !== false){ decision="blocked_network_call_detected"; reason="Netzwerk-/Provider-Aufruf wäre erlaubt oder wurde durchgeführt."; }
  else if(stub.providerExecutionAllowed !== false){ decision="blocked_provider_execution_allowed"; reason="Provider Execution ist nicht blockiert."; }
  else if(stub.realLlmCallAllowed !== false || stub.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(stub.executionAllowed !== false || stub.toolExecutionAllowed !== false || stub.agentExecutionAllowed !== false || stub.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Adapter Stub verletzt Execution Safety Invariants."; }
  else if(stub.noSecretsIncluded !== true || containsSecretPattern(promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Provider Request Preview erkannt."; }
  else if(stub.providerRequestPreview?.outputContractType !== "recommendation_explanation_only"){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt recommendation_explanation_only."; }
  const sim: ProviderAdapterPolicySimulation={
    id:makeId("provider-adapter-policy-sim"),
    timestamp:new Date().toISOString(),
    adapterStubId:stub?.id || input.adapterStubId,
    invocationEnvelopeId:stub?.invocationEnvelopeId,
    consentRequestId:stub?.consentRequestId,
    gateId:stub?.gateId,
    responseId:stub?.responseId,
    envelopeId:stub?.envelopeId,
    recommendationId:stub?.recommendationId,
    actionType:stub?.actionType,
    decision,
    policyChecks:checks,
    adapterMode:"provider_agnostic_no_network_stub",
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"22.1", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, adapterPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.adapterStubId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Provider Adapter Policy Simulation: "+sim.decision,
    metadata:{ source:"phase22.1-provider-adapter-policy", simulationId:sim.id, adapterStubId:sim.adapterStubId, networkCallPerformed:false, llmCallPerformed:false, realLlmCallAllowed:false },
  });
  return sim;
}
export function summarizeProviderAdapterPolicySimulations(sims:ProviderAdapterPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
