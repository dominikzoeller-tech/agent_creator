import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReadinessPolicyDecision =
  | "provider_dispatch_readiness_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_dispatch_readiness"
  | "blocked_dispatch_not_prepared"
  | "blocked_dispatch_performed"
  | "blocked_not_metadata_only"
  | "blocked_dispatch_payload_included"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReadinessPolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchReadinessId?:string;
  providerRequestEnvelopeId?:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  decision:ProviderDispatchReadinessPolicyDecision;
  policyMode:"provider_dispatch_readiness_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerDispatchPrepared:true;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
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
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-readiness-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchReadinessPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReadinessPolicySimulations(limit=100): ProviderDispatchReadinessPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderDispatchReadinessPolicy(input:{ providerDispatchReadinessId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReadinessPolicySimulation {
  ensureStore();
  const readinessItems=readJsonl(readinessPath());
  const readiness=input.providerDispatchReadinessId ? readinessItems.find((entry:any)=>entry.id===input.providerDispatchReadinessId) : readinessItems[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"readiness_exists", passed:Boolean(readiness), reason:readiness?"Provider Dispatch Readiness gefunden.":"Provider Dispatch Readiness fehlt." });
  checks.push({ name:"readiness_mode_metadata_only_no_provider_call", passed:readiness?.readinessMode === "controlled_provider_dispatch_readiness_metadata_only_no_provider_call", reason:"Readiness muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"dispatch_prepared", passed:readiness?.providerDispatchPrepared===true, reason:"Provider Dispatch muss nur vorbereitet sein." });
  checks.push({ name:"dispatch_not_performed", passed:readiness?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"metadata_only", passed:readiness?.metadataOnly===true, reason:"Dispatch Readiness muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:readiness?.provider==="none" && readiness?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"dispatch_payload_not_included", passed:readiness?.dispatchPayloadIncluded===false, reason:"Dispatch Payload darf nicht enthalten sein." });
  checks.push({ name:"envelope_payload_not_included", passed:readiness?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:readiness?.promptPayloadIncluded===false && readiness?.promptIncluded===false && readiness?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:readiness?.secretValuesIncluded===false && readiness?.noSecretsIncluded===true && !containsSecretValue(readiness), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:readiness?.requestBodyIncluded===false && readiness?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:readiness?.networkCallPerformed===false && readiness?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:readiness?.realLlmCallAllowed===false && readiness?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:readiness?.executionAllowed===false && readiness?.toolExecutionAllowed===false && readiness?.agentExecutionAllowed===false && readiness?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchReadinessPolicyDecision="provider_dispatch_readiness_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Dispatch Readiness Policy erlaubt nur metadata-only Simulation. Kein Dispatch, kein Provider-/Netzwerk-Aufruf.";
  if(!readiness){ decision="blocked_missing_provider_dispatch_readiness"; reason="Provider Dispatch Readiness fehlt."; }
  else if(readiness.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_prepared"; reason="Provider Dispatch ist nicht vorbereitet."; }
  else if(readiness.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder Status ist nicht false."; }
  else if(readiness.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Dispatch Readiness ist nicht metadata-only."; }
  else if(readiness.dispatchPayloadIncluded!==false){ decision="blocked_dispatch_payload_included"; reason="Dispatch Payload ist enthalten."; }
  else if(readiness.envelopePayloadIncluded!==false){ decision="blocked_envelope_payload_included"; reason="Envelope Payload ist enthalten."; }
  else if(readiness.promptPayloadIncluded!==false || readiness.promptIncluded!==false || readiness.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload, Prompt oder redacted Preview ist enthalten."; }
  else if(readiness.secretValuesIncluded!==false || readiness.noSecretsIncluded!==true || containsSecretValue(readiness)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(readiness.requestBodyIncluded!==false || readiness.sensitiveRequestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body oder sensitive Request Body ist enthalten."; }
  else if(readiness.provider!=="none" || readiness.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(readiness.networkCallPerformed!==false || readiness.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(readiness.executionAllowed!==false || readiness.toolExecutionAllowed!==false || readiness.agentExecutionAllowed!==false || readiness.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchReadinessPolicySimulation={
    id:makeId("provider-dispatch-readiness-policy-sim"), timestamp:new Date().toISOString(), providerDispatchReadinessId:readiness?.id||input.providerDispatchReadinessId, providerRequestEnvelopeId:readiness?.providerRequestEnvelopeId, providerRequestContractId:readiness?.providerRequestContractId, tokenBackedPreflightId:readiness?.tokenBackedPreflightId,
    decision, policyMode:"provider_dispatch_readiness_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"33.1", providerDispatchReadinessPolicyOnly:true, metadataOnly:true, providerDispatchPrepared:true, providerDispatchPerformed:false, noNetworkCall:true, noProviderCall:true, noDispatch:true, noPromptPayload:true, noDispatchPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchReadinessId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Readiness Policy Simulation: "+sim.decision, metadata:{ source:"phase33.1-provider-dispatch-readiness-policy", simulationId:sim.id, providerDispatchReadinessId:sim.providerDispatchReadinessId, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchReadinessPolicySimulations(sims:ProviderDispatchReadinessPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
