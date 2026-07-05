import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReleaseCandidateEnvelopeDecision =
  | "provider_dispatch_release_candidate_envelope_prepared_no_provider_call"
  | "blocked_missing_transcript_envelope"
  | "blocked_transcript_envelope_not_prepared"
  | "blocked_transcript_contains_provider_response"
  | "blocked_transcript_contains_prompt_payload"
  | "blocked_transcript_contains_secrets"
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

export interface ProviderDispatchReleaseCandidateEnvelope {
  id:string;
  timestamp:string;
  providerDispatchTranscriptEnvelopeId?:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchReleaseCandidateEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_release_candidate_envelope_no_provider_call";
  providerDispatchReleaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePersisted:true;
  releaseCandidateReadyForHumanReview:true;
  releaseCandidateApproved:false;
  releaseCandidateExecuted:false;
  releaseCandidateContainsProviderResponse:false;
  releaseCandidateContainsPromptPayload:false;
  releaseCandidateContainsSecrets:false;
  transcriptEnvelopePrepared:true;
  transcriptEnvelopePersisted:true;
  transcriptEnvelopeContainsProviderResponse:false;
  transcriptEnvelopeContainsPromptPayload:false;
  transcriptEnvelopeContainsSecrets:false;
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
function transcriptEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-transcript-envelopes.jsonl"); }
function releaseCandidateEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchReleaseCandidateEnvelope): void { ensureStore(); appendFileSync(releaseCandidateEnvelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReleaseCandidateEnvelopes(limit=100): ProviderDispatchReleaseCandidateEnvelope[] {
  ensureStore();
  return readJsonl(releaseCandidateEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchReleaseCandidateEnvelope(input:{ providerDispatchTranscriptEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReleaseCandidateEnvelope {
  ensureStore();
  const envelopes=readJsonl(transcriptEnvelopePath());
  const transcript=input.providerDispatchTranscriptEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchTranscriptEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchReleaseCandidateEnvelopeDecision="provider_dispatch_release_candidate_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Release Candidate Envelope wurde nur vorbereitet und ist nur bereit für Human Review. Es wird nicht approved, nicht ausgeführt und enthält keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Provider-/Netzwerk-Aufruf.";
  if(!transcript){ decision="blocked_missing_transcript_envelope"; reason="Provider Dispatch Transcript Envelope fehlt."; }
  else if(transcript.providerDispatchTranscriptEnvelopePrepared!==true || transcript.transcriptEnvelopePrepared!==true || transcript.transcriptEnvelopePersisted!==true){ decision="blocked_transcript_envelope_not_prepared"; reason="Transcript Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(transcript.transcriptEnvelopeContainsProviderResponse!==false || transcript.providerResponseIncluded!==false || transcript.providerResultIncluded!==false){ decision="blocked_transcript_contains_provider_response"; reason="Transcript enthält Provider Response oder Provider Result."; }
  else if(transcript.transcriptEnvelopeContainsPromptPayload!==false || transcript.promptPayloadIncluded!==false || transcript.promptIncluded!==false){ decision="blocked_transcript_contains_prompt_payload"; reason="Transcript enthält Prompt Payload."; }
  else if(transcript.transcriptEnvelopeContainsSecrets!==false || transcript.secretValuesIncluded!==false || transcript.noSecretsIncluded!==true || containsSecretValue(transcript)){ decision="blocked_transcript_contains_secrets"; reason="Transcript enthält Secret-Werte."; }
  else if(transcript.resultEnvelopeContainsProviderResponse!==false){ decision="blocked_result_envelope_contains_provider_response"; reason="Result Envelope enthält Provider Response."; }
  else if(transcript.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(transcript.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(transcript.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(transcript.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder ist nicht sicher false."; }
  else if(transcript.provider!=="none" || transcript.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(transcript.dispatchPayloadIncluded!==false || transcript.commandPayloadIncluded!==false || transcript.requestBodyIncluded!==false || transcript.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(transcript.secretValuesIncluded!==false || transcript.noSecretsIncluded!==true || containsSecretValue(transcript)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(transcript.networkCallAllowed!==false || transcript.networkCallPerformed!==false || transcript.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(transcript.executionAllowed!==false || transcript.toolExecutionAllowed!==false || transcript.agentExecutionAllowed!==false || transcript.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchReleaseCandidateEnvelope={
    id:makeId("provider-dispatch-release-candidate-envelope"), timestamp:new Date().toISOString(), providerDispatchTranscriptEnvelopeId:transcript?.id || input.providerDispatchTranscriptEnvelopeId, providerDispatchDryRunResultEnvelopeId:transcript?.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:transcript?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:transcript?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:transcript?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:transcript?.providerDispatchTokenBindingId, providerDispatchReadinessId:transcript?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_release_candidate_envelope_no_provider_call", providerDispatchReleaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePersisted:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, transcriptEnvelopePrepared:true, transcriptEnvelopePersisted:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included" && decision!=="blocked_transcript_contains_secrets", reason, metadata:{ ...(input.metadata||{}), phase:"40.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchTranscriptEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Release Candidate Envelope: "+envelope.decision, metadata:{ source:"phase40.0-provider-dispatch-release-candidate-envelope", envelopeId:envelope.id, providerDispatchTranscriptEnvelopeId:envelope.providerDispatchTranscriptEnvelopeId, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchReleaseCandidateEnvelopes(envelopes:ProviderDispatchReleaseCandidateEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
