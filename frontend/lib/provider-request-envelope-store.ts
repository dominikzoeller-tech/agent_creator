import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestEnvelopeDecision =
  | "provider_request_envelope_assembled_no_provider_call"
  | "blocked_missing_provider_request_contract"
  | "blocked_contract_not_prepared"
  | "blocked_not_metadata_only"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestEnvelope {
  id: string;
  timestamp: string;
  providerRequestContractId?: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  issuanceGateId?: string;
  decision: ProviderRequestEnvelopeDecision;
  envelopeMode: "controlled_provider_request_envelope_metadata_only_no_provider_call";
  envelopeChecks: Array<{ name: string; passed: boolean; reason: string }>;
  envelope: {
    provider: "none";
    modelSelected: "none";
    metadataOnly: true;
    envelopeAssembled: true;
    envelopePayloadIncluded: false;
    promptPayloadIncluded: false;
    promptIncluded: false;
    promptRedactedPreviewIncluded: false;
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
  providerRequestEnvelopeAssembled: true;
  providerRequestContractPrepared: true;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
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
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(item: ProviderRequestEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestEnvelopes(limit=100): ProviderRequestEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderRequestEnvelope(input:{ providerRequestContractId?: string; metadata?: Record<string, unknown> }): ProviderRequestEnvelope {
  ensureStore();
  const contracts=readJsonl(contractPath());
  const contract=input.providerRequestContractId ? contracts.find((entry:any)=>entry.id===input.providerRequestContractId) : contracts[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"provider_request_contract_exists", passed:Boolean(contract), reason:contract?"Provider Request Contract gefunden.":"Provider Request Contract fehlt." });
  checks.push({ name:"provider_request_contract_prepared", passed:contract?.providerRequestContractPrepared===true, reason:"Provider Request Contract muss vorbereitet sein." });
  checks.push({ name:"contract_metadata_only", passed:contract?.metadataOnly===true, reason:"Contract muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:contract?.provider==="none" && contract?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_payload_not_included", passed:contract?.promptIncluded===false && contract?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload und redacted Preview dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:contract?.secretValuesIncluded===false && contract?.noSecretsIncluded===true && !containsSecretValue(contract), reason:"Secret-Werte dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:contract?.requestBodyIncluded===false, reason:"Request Body darf nicht enthalten sein." });
  checks.push({ name:"envelope_payload_not_included", passed:true, reason:"Envelope Payload bleibt in Phase 32.0 nicht enthalten." });
  checks.push({ name:"metadata_only_envelope", passed:true, reason:"Provider Request Envelope bleibt metadata-only." });
  checks.push({ name:"network_provider_blocked", passed:contract?.networkCallPerformed===false && contract?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:contract?.realLlmCallAllowed===false && contract?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:contract?.executionAllowed===false && contract?.toolExecutionAllowed===false && contract?.agentExecutionAllowed===false && contract?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  let decision:ProviderRequestEnvelopeDecision="provider_request_envelope_assembled_no_provider_call";
  let reason="Provider Request Envelope metadata-only assembliert. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.";
  if(!contract){ decision="blocked_missing_provider_request_contract"; reason="Provider Request Contract fehlt."; }
  else if(contract.providerRequestContractPrepared!==true){ decision="blocked_contract_not_prepared"; reason="Provider Request Contract ist nicht vorbereitet."; }
  else if(contract.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Contract ist nicht metadata-only."; }
  else if(contract.promptIncluded!==false || contract.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload oder redacted Preview ist enthalten."; }
  else if(contract.secretValuesIncluded!==false || contract.noSecretsIncluded!==true || containsSecretValue(contract)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(contract.requestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body ist enthalten."; }
  else if(contract.provider!=="none" || contract.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(contract.networkCallPerformed!==false || contract.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(contract.executionAllowed!==false || contract.toolExecutionAllowed!==false || contract.agentExecutionAllowed!==false || contract.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:ProviderRequestEnvelope={
    id:makeId("provider-request-envelope"), timestamp:new Date().toISOString(), providerRequestContractId:contract?.id||input.providerRequestContractId, tokenBackedPreflightId:contract?.tokenBackedPreflightId, activationGateId:contract?.activationGateId, issuanceGateId:contract?.issuanceGateId, decision,
    envelopeMode:"controlled_provider_request_envelope_metadata_only_no_provider_call", envelopeChecks:checks,
    envelope:{ provider:"none", modelSelected:"none", metadataOnly:true, envelopeAssembled:true, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerRequestEnvelopeAssembled:true, providerRequestContractPrepared:true, metadataOnly:true, provider:"none", modelSelected:"none", envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"32.0", providerRequestEnvelopeOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendEnvelope(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Request Envelope assembled: "+item.decision, metadata:{ source:"phase32.0-provider-request-envelope", envelopeId:item.id, providerRequestContractId:item.providerRequestContractId, metadataOnly:true, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, envelopePayloadIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderRequestEnvelopes(items:ProviderRequestEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }

