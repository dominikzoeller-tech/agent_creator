import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTranscriptEnvelopeDecision =
  | "provider_dispatch_transcript_envelope_prepared_no_provider_call"
  | "blocked_missing_dry_run_result_envelope"
  | "blocked_dry_run_result_envelope_not_prepared"
  | "blocked_result_envelope_contains_provider_response"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTranscriptEnvelope {
  id:string;
  timestamp:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchTranscriptEnvelopeDecision;
  transcriptMode:"controlled_provider_dispatch_transcript_envelope_no_provider_call";
  providerDispatchTranscriptEnvelopePrepared:true;
  transcriptEnvelopePrepared:true;
  transcriptEnvelopePersisted:true;
  transcriptEnvelopeContainsProviderResponse:false;
  transcriptEnvelopeContainsPromptPayload:false;
  transcriptEnvelopeContainsSecrets:false;
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
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resultEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelopes.jsonl"); }
function transcriptEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-transcript-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/?
/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchTranscriptEnvelope): void { ensureStore(); appendFileSync(transcriptEnvelopePath(), JSON.stringify(envelope)+"
", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchTranscriptEnvelopes(limit=100): ProviderDispatchTranscriptEnvelope[] {
  ensureStore();
  return readJsonl(transcriptEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchTranscriptEnvelope(input:{ providerDispatchDryRunResultEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTranscriptEnvelope {
  ensureStore();
  const envelopes=readJsonl(resultEnvelopePath());
  const resultEnvelope=input.providerDispatchDryRunResultEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchDryRunResultEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchTranscriptEnvelopeDecision="provider_dispatch_transcript_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Transcript Envelope wurde nur vorbereitet. Es enthält keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Provider-/Netzwerk-Aufruf.";
  if(!resultEnvelope){ decision="blocked_missing_dry_run_result_envelope"; reason="Provider Dispatch Dry-Run Result Envelope fehlt."; }
  else if(resultEnvelope.providerDispatchDryRunResultEnvelopePrepared!==true || resultEnvelope.resultEnvelopePrepared!==true || resultEnvelope.resultEnvelopePersisted!==true){ decision="blocked_dry_run_result_envelope_not_prepared"; reason="Dry-Run Result Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(resultEnvelope.resultEnvelopeContainsProviderResponse!==false || resultEnvelope.providerResponseIncluded!==false || resultEnvelope.providerResultIncluded!==false){ decision="blocked_result_envelope_contains_provider_response"; reason="Result Envelope enthält Provider Response oder Provider Result."; }
  else if(resultEnvelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(resultEnvelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(resultEnvelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(resultEnvelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder ist nicht sicher false."; }
  else if(resultEnvelope.provider!=="none" || resultEnvelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(resultEnvelope.dispatchPayloadIncluded!==false || resultEnvelope.commandPayloadIncluded!==false || resultEnvelope.promptPayloadIncluded!==false || resultEnvelope.promptIncluded!==false || resultEnvelope.requestBodyIncluded!==false || resultEnvelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Command-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(resultEnvelope.secretValuesIncluded!==false || resultEnvelope.noSecretsIncluded!==true || containsSecretValue(resultEnvelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(resultEnvelope.networkCallAllowed!==false || resultEnvelope.networkCallPerformed!==false || resultEnvelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(resultEnvelope.executionAllowed!==false || resultEnvelope.toolExecutionAllowed!==false || resultEnvelope.agentExecutionAllowed!==false || resultEnvelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchTranscriptEnvelope={
    id:makeId("provider-dispatch-transcript-envelope"), timestamp:new Date().toISOString(), providerDispatchDryRunResultEnvelopeId:resultEnvelope?.id || input.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:resultEnvelope?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:resultEnvelope?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:resultEnvelope?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:resultEnvelope?.providerDispatchTokenBindingId, providerDispatchReadinessId:resultEnvelope?.providerDispatchReadinessId, decision, transcriptMode:"controlled_provider_dispatch_transcript_envelope_no_provider_call", providerDispatchTranscriptEnvelopePrepared:true, transcriptEnvelopePrepared:true, transcriptEnvelopePersisted:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopePrepared:true, resultEnvelopePersisted:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"39.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchDryRunResultEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Transcript Envelope: "+envelope.decision, metadata:{ source:"phase39.0-provider-dispatch-transcript-envelope", envelopeId:envelope.id, providerDispatchDryRunResultEnvelopeId:envelope.providerDispatchDryRunResultEnvelopeId, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchTranscriptEnvelopes(envelopes:ProviderDispatchTranscriptEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
