import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchDryRunResultEnvelopePolicyDecision =
  | "provider_dispatch_dry_run_result_envelope_policy_allowed_no_provider_call"
  | "blocked_missing_dry_run_result_envelope"
  | "blocked_dry_run_result_envelope_not_prepared"
  | "blocked_result_envelope_contains_provider_response"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchDryRunResultEnvelopePolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchDryRunResultEnvelopePolicyDecision;
  policyMode:"provider_dispatch_dry_run_result_envelope_policy_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerDispatchDryRunResultEnvelopePrepared:true;
  resultEnvelopePrepared:true;
  resultEnvelopePersisted:true;
  resultEnvelopeContainsProviderResponse:false;
  commandEnvelopePrepared:true;
  commandEnvelopeExecuted:false;
  executionGateOpen:false;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
  commandPayloadIncluded:false;
  promptPayloadIncluded:false;
  promptIncluded:false;
  providerResponseIncluded:false;
  providerResultIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
  sensitiveRequestBodyIncluded:false;
  networkCallAllowed:false;
  networkCallPerformed:false;
  providerExecutionAllowed:false;
  realLlmCallAllowed:false;
  llmCallPerformed:false;
  executionAllowed:false;
  toolExecutionAllowed:false;
  agentExecutionAllowed:false;
  dryRunOnly:true;
  noSecretsIncluded:boolean;
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resultEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/?
/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchDryRunResultEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"
", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchDryRunResultEnvelopePolicySimulations(limit=100): ProviderDispatchDryRunResultEnvelopePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function simulateProviderDispatchDryRunResultEnvelopePolicy(input:{ providerDispatchDryRunResultEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchDryRunResultEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(resultEnvelopePath());
  const envelope=input.providerDispatchDryRunResultEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchDryRunResultEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"dry_run_result_envelope_exists", passed:Boolean(envelope), reason:envelope?"Provider Dispatch Dry-Run Result Envelope gefunden.":"Provider Dispatch Dry-Run Result Envelope fehlt." });
  checks.push({ name:"dry_run_result_envelope_prepared", passed:envelope?.providerDispatchDryRunResultEnvelopePrepared===true && envelope?.resultEnvelopePrepared===true && envelope?.resultEnvelopePersisted===true, reason:"Dry-Run Result Envelope muss vorbereitet und persistiert sein." });
  checks.push({ name:"no_provider_response", passed:envelope?.resultEnvelopeContainsProviderResponse===false && envelope?.providerResponseIncluded===false && envelope?.providerResultIncluded===false, reason:"Result Envelope darf keine Provider Response und kein Provider Result enthalten." });
  checks.push({ name:"command_envelope_not_executed", passed:envelope?.commandEnvelopeExecuted===false, reason:"Command Envelope darf nicht ausgeführt sein." });
  checks.push({ name:"execution_gate_closed", passed:envelope?.executionGateOpen===false, reason:"Execution Gate muss geschlossen bleiben." });
  checks.push({ name:"final_dispatch_not_allowed", passed:envelope?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:envelope?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"metadata_only", passed:envelope?.metadataOnly===true, reason:"Result Envelope bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:envelope?.dispatchPayloadIncluded===false && envelope?.commandPayloadIncluded===false && envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false && envelope?.requestBodyIncluded===false && envelope?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Command-, Prompt- und Request-Payloads dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallAllowed===false && envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:envelope?.realLlmCallAllowed===false && envelope?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchDryRunResultEnvelopePolicyDecision="provider_dispatch_dry_run_result_envelope_policy_allowed_no_provider_call";
  let reason="Provider Dispatch Dry-Run Result Envelope Policy erlaubt nur no-provider-call Simulation. Result Envelope enthält keine Provider Response.";
  if(!envelope){ decision="blocked_missing_dry_run_result_envelope"; reason="Provider Dispatch Dry-Run Result Envelope fehlt."; }
  else if(envelope.providerDispatchDryRunResultEnvelopePrepared!==true || envelope.resultEnvelopePrepared!==true || envelope.resultEnvelopePersisted!==true){ decision="blocked_dry_run_result_envelope_not_prepared"; reason="Dry-Run Result Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(envelope.resultEnvelopeContainsProviderResponse!==false || envelope.providerResponseIncluded!==false || envelope.providerResultIncluded!==false){ decision="blocked_result_envelope_contains_provider_response"; reason="Result Envelope enthält Provider Response oder Provider Result."; }
  else if(envelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(envelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(envelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(envelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt."; }
  else if(envelope.provider!=="none" || envelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(envelope.networkCallAllowed!==false || envelope.networkCallPerformed!==false || envelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(envelope.dispatchPayloadIncluded!==false || envelope.commandPayloadIncluded!==false || envelope.promptPayloadIncluded!==false || envelope.promptIncluded!==false || envelope.requestBodyIncluded!==false || envelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchDryRunResultEnvelopePolicySimulation={
    id:makeId("provider-dispatch-dry-run-result-envelope-policy-sim"), timestamp:new Date().toISOString(), providerDispatchDryRunResultEnvelopeId:envelope?.id||input.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:envelope?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:envelope?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:envelope?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:envelope?.providerDispatchTokenBindingId, providerDispatchReadinessId:envelope?.providerDispatchReadinessId, decision, policyMode:"provider_dispatch_dry_run_result_envelope_policy_no_provider_call", policyChecks:checks, providerDispatchDryRunResultEnvelopePrepared:true, resultEnvelopePrepared:true, resultEnvelopePersisted:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"38.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchDryRunResultEnvelopeId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Dry-Run Result Envelope Policy Simulation: "+sim.decision, metadata:{ source:"phase38.1-provider-dispatch-dry-run-result-envelope-policy", simulationId:sim.id, providerDispatchDryRunResultEnvelopeId:sim.providerDispatchDryRunResultEnvelopeId, resultEnvelopeContainsProviderResponse:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchDryRunResultEnvelopePolicySimulations(sims:ProviderDispatchDryRunResultEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
