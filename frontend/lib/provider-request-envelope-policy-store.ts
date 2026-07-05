import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestEnvelopePolicyDecision =
  | "provider_request_envelope_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_request_envelope"
  | "blocked_envelope_not_assembled"
  | "blocked_not_metadata_only"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestEnvelopePolicySimulation {
  id:string;
  timestamp:string;
  providerRequestEnvelopeId?:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  activationGateId?:string;
  decision:ProviderRequestEnvelopePolicyDecision;
  policyMode:"provider_request_envelope_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerRequestEnvelopeAssembled:true;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  envelopePayloadIncluded:false;
  promptPayloadIncluded:false;
  promptIncluded:false;
  promptRedactedPreviewIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
  sensitiveRequestBodyIncluded:false;
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
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-request-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderRequestEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestEnvelopePolicySimulations(limit=100): ProviderRequestEnvelopePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderRequestEnvelopePolicy(input:{ providerRequestEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderRequestEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.providerRequestEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerRequestEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"envelope_exists", passed:Boolean(envelope), reason:envelope?"Provider Request Envelope gefunden.":"Provider Request Envelope fehlt." });
  checks.push({ name:"envelope_mode_metadata_only_no_provider_call", passed:envelope?.envelopeMode === "controlled_provider_request_envelope_metadata_only_no_provider_call", reason:"Envelope muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"envelope_assembled", passed:envelope?.providerRequestEnvelopeAssembled===true, reason:"Provider Request Envelope muss assembliert sein." });
  checks.push({ name:"metadata_only", passed:envelope?.metadataOnly===true, reason:"Envelope muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"envelope_payload_not_included", passed:envelope?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false && envelope?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:envelope?.requestBodyIncluded===false && envelope?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:envelope?.realLlmCallAllowed===false && envelope?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestEnvelopePolicyDecision="provider_request_envelope_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Request Envelope Policy erlaubt nur metadata-only Simulation. Kein Provider-/Netzwerk-Aufruf.";
  if(!envelope){ decision="blocked_missing_provider_request_envelope"; reason="Provider Request Envelope fehlt."; }
  else if(envelope.providerRequestEnvelopeAssembled!==true){ decision="blocked_envelope_not_assembled"; reason="Provider Request Envelope ist nicht assembliert."; }
  else if(envelope.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Envelope ist nicht metadata-only."; }
  else if(envelope.envelopePayloadIncluded!==false){ decision="blocked_envelope_payload_included"; reason="Envelope Payload ist enthalten."; }
  else if(envelope.promptPayloadIncluded!==false || envelope.promptIncluded!==false || envelope.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload, Prompt oder redacted Preview ist enthalten."; }
  else if(envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(envelope.requestBodyIncluded!==false || envelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body oder sensitive Request Body ist enthalten."; }
  else if(envelope.provider!=="none" || envelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(envelope.networkCallPerformed!==false || envelope.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderRequestEnvelopePolicySimulation={
    id:makeId("provider-request-envelope-policy-sim"), timestamp:new Date().toISOString(), providerRequestEnvelopeId:envelope?.id||input.providerRequestEnvelopeId, providerRequestContractId:envelope?.providerRequestContractId, tokenBackedPreflightId:envelope?.tokenBackedPreflightId, activationGateId:envelope?.activationGateId,
    decision, policyMode:"provider_request_envelope_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerRequestEnvelopeAssembled:true, metadataOnly:true, provider:"none", modelSelected:"none", envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"32.1", providerRequestEnvelopePolicyOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noPromptPayload:true, noEnvelopePayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerRequestEnvelopeId, status:sim.decision, riskLevel:"critical", summary:"Provider Request Envelope Policy Simulation: "+sim.decision, metadata:{ source:"phase32.1-provider-request-envelope-policy", simulationId:sim.id, providerRequestEnvelopeId:sim.providerRequestEnvelopeId, metadataOnly:true, envelopePayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderRequestEnvelopePolicySimulations(sims:ProviderRequestEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
