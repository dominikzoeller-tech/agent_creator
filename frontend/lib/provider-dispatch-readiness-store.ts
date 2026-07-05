import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReadinessDecision =
  | "provider_dispatch_readiness_prepared_no_provider_call"
  | "blocked_missing_provider_request_envelope"
  | "blocked_envelope_not_assembled"
  | "blocked_not_metadata_only"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_dispatch_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReadiness {
  id: string;
  timestamp: string;
  providerRequestEnvelopeId?: string;
  providerRequestContractId?: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  decision: ProviderDispatchReadinessDecision;
  readinessMode: "controlled_provider_dispatch_readiness_metadata_only_no_provider_call";
  readinessChecks: Array<{ name: string; passed: boolean; reason: string }>;
  dispatchPlan: {
    providerDispatchPrepared: true;
    providerDispatchPerformed: false;
    provider: "none";
    modelSelected: "none";
    metadataOnly: true;
    dispatchPayloadIncluded: false;
    envelopePayloadIncluded: false;
    promptPayloadIncluded: false;
    secretValuesIncluded: false;
    requestBodyIncluded: false;
    sensitiveRequestBodyIncluded: false;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  providerDispatchPrepared: true;
  providerDispatchPerformed: false;
  providerRequestEnvelopeAssembled: true;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
  dispatchPayloadIncluded: false;
  envelopePayloadIncluded: false;
  promptPayloadIncluded: false;
  promptIncluded: false;
  promptRedactedPreviewIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  sensitiveRequestBodyIncluded: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendReadiness(item: ProviderDispatchReadiness): void { ensureStore(); appendFileSync(readinessPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReadiness(limit=100): ProviderDispatchReadiness[] { ensureStore(); return readJsonl(readinessPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderDispatchReadiness(input:{ providerRequestEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReadiness {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.providerRequestEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerRequestEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"provider_request_envelope_exists", passed:Boolean(envelope), reason:envelope?"Provider Request Envelope gefunden.":"Provider Request Envelope fehlt." });
  checks.push({ name:"provider_request_envelope_assembled", passed:envelope?.providerRequestEnvelopeAssembled===true, reason:"Provider Request Envelope muss assembliert sein." });
  checks.push({ name:"metadata_only", passed:envelope?.metadataOnly===true, reason:"Dispatch Readiness bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"envelope_payload_not_included", passed:envelope?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false && envelope?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:envelope?.requestBodyIncluded===false && envelope?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"dispatch_not_performed", passed:true, reason:"Provider Dispatch wird in Phase 33.0 nicht ausgeführt." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:envelope?.realLlmCallAllowed===false && envelope?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchReadinessDecision="provider_dispatch_readiness_prepared_no_provider_call";
  let reason="Provider Dispatch Readiness metadata-only vorbereitet. Kein Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.";
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
  const item:ProviderDispatchReadiness={
    id:makeId("provider-dispatch-readiness"), timestamp:new Date().toISOString(), providerRequestEnvelopeId:envelope?.id||input.providerRequestEnvelopeId, providerRequestContractId:envelope?.providerRequestContractId, tokenBackedPreflightId:envelope?.tokenBackedPreflightId, activationGateId:envelope?.activationGateId, decision,
    readinessMode:"controlled_provider_dispatch_readiness_metadata_only_no_provider_call", readinessChecks:checks,
    dispatchPlan:{ providerDispatchPrepared:true, providerDispatchPerformed:false, provider:"none", modelSelected:"none", metadataOnly:true, dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerDispatchPrepared:true, providerDispatchPerformed:false, providerRequestEnvelopeAssembled:true, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"33.0", providerDispatchReadinessOnly:true, metadataOnly:true, providerDispatchPerformed:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendReadiness(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Dispatch Readiness prepared: "+item.decision, metadata:{ source:"phase33.0-provider-dispatch-readiness", readinessId:item.id, providerRequestEnvelopeId:item.providerRequestEnvelopeId, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderDispatchReadiness(items:ProviderDispatchReadiness[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
