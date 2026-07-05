import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReleaseCandidateEnvelopePolicyDecision =
  | "provider_dispatch_release_candidate_envelope_policy_allowed_human_review_only_no_provider_call"
  | "blocked_missing_release_candidate_envelope"
  | "blocked_release_candidate_envelope_not_prepared"
  | "blocked_release_candidate_not_ready_for_human_review"
  | "blocked_release_candidate_approved"
  | "blocked_release_candidate_executed"
  | "blocked_release_candidate_contains_provider_response"
  | "blocked_release_candidate_contains_prompt_payload"
  | "blocked_release_candidate_contains_secrets"
  | "blocked_transcript_contains_provider_response"
  | "blocked_transcript_contains_prompt_payload"
  | "blocked_transcript_contains_secrets"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReleaseCandidateEnvelopePolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchReleaseCandidateEnvelopeId?:string;
  providerDispatchTranscriptEnvelopeId?:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  decision:ProviderDispatchReleaseCandidateEnvelopePolicyDecision;
  policyMode:"provider_dispatch_release_candidate_envelope_policy_human_review_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerDispatchReleaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePersisted:true;
  releaseCandidateReadyForHumanReview:true;
  releaseCandidateApproved:false;
  releaseCandidateExecuted:false;
  releaseCandidateContainsProviderResponse:false;
  releaseCandidateContainsPromptPayload:false;
  releaseCandidateContainsSecrets:false;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function releaseCandidateEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchReleaseCandidateEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReleaseCandidateEnvelopePolicySimulations(limit=100): ProviderDispatchReleaseCandidateEnvelopePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function simulateProviderDispatchReleaseCandidateEnvelopePolicy(input:{ providerDispatchReleaseCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReleaseCandidateEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(releaseCandidateEnvelopePath());
  const envelope=input.providerDispatchReleaseCandidateEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchReleaseCandidateEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"release_candidate_exists", passed:Boolean(envelope), reason:envelope?"Release Candidate Envelope gefunden.":"Release Candidate Envelope fehlt." });
  checks.push({ name:"release_candidate_prepared", passed:envelope?.providerDispatchReleaseCandidateEnvelopePrepared===true && envelope?.releaseCandidateEnvelopePrepared===true && envelope?.releaseCandidateEnvelopePersisted===true, reason:"Release Candidate Envelope muss vorbereitet und persistiert sein." });
  checks.push({ name:"human_review_only", passed:envelope?.releaseCandidateReadyForHumanReview===true && envelope?.releaseCandidateApproved===false && envelope?.releaseCandidateExecuted===false, reason:"Release Candidate ist nur Human-Review-ready, nicht approved und nicht ausgefÃ¼hrt." });
  checks.push({ name:"release_candidate_no_provider_response", passed:envelope?.releaseCandidateContainsProviderResponse===false && envelope?.providerResponseIncluded===false && envelope?.providerResultIncluded===false, reason:"Release Candidate darf keine Provider Response und kein Provider Result enthalten." });
  checks.push({ name:"release_candidate_no_prompt_payload", passed:envelope?.releaseCandidateContainsPromptPayload===false && envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false, reason:"Release Candidate darf keinen Prompt Payload enthalten." });
  checks.push({ name:"release_candidate_no_secrets", passed:envelope?.releaseCandidateContainsSecrets===false && envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Release Candidate darf keine Secret-Werte enthalten." });
  checks.push({ name:"transcript_clean", passed:envelope?.transcriptEnvelopeContainsProviderResponse===false && envelope?.transcriptEnvelopeContainsPromptPayload===false && envelope?.transcriptEnvelopeContainsSecrets===false, reason:"Transcript bleibt ohne Provider Response, Prompt Payload und Secrets." });
  checks.push({ name:"command_envelope_not_executed", passed:envelope?.commandEnvelopeExecuted===false, reason:"Command Envelope darf nicht ausgefÃ¼hrt sein." });
  checks.push({ name:"execution_gate_closed", passed:envelope?.executionGateOpen===false, reason:"Execution Gate muss geschlossen bleiben." });
  checks.push({ name:"final_dispatch_not_allowed", passed:envelope?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:envelope?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgefÃ¼hrt sein." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallAllowed===false && envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });

  let decision:ProviderDispatchReleaseCandidateEnvelopePolicyDecision="provider_dispatch_release_candidate_envelope_policy_allowed_human_review_only_no_provider_call";
  let reason="Policy erlaubt nur Human-Review-ready Release Candidate ohne Approval, ohne Execution, ohne Provider-/Netzwerk-Aufruf und ohne Provider Response, Prompt Payload oder Secrets.";
  if(!envelope){ decision="blocked_missing_release_candidate_envelope"; reason="Release Candidate Envelope fehlt."; }
  else if(envelope.providerDispatchReleaseCandidateEnvelopePrepared!==true || envelope.releaseCandidateEnvelopePrepared!==true || envelope.releaseCandidateEnvelopePersisted!==true){ decision="blocked_release_candidate_envelope_not_prepared"; reason="Release Candidate Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(envelope.releaseCandidateReadyForHumanReview!==true){ decision="blocked_release_candidate_not_ready_for_human_review"; reason="Release Candidate ist nicht Human-Review-ready."; }
  else if(envelope.releaseCandidateApproved!==false){ decision="blocked_release_candidate_approved"; reason="Release Candidate wurde approved."; }
  else if(envelope.releaseCandidateExecuted!==false){ decision="blocked_release_candidate_executed"; reason="Release Candidate wurde ausgefÃ¼hrt."; }
  else if(envelope.releaseCandidateContainsProviderResponse!==false || envelope.providerResponseIncluded!==false || envelope.providerResultIncluded!==false){ decision="blocked_release_candidate_contains_provider_response"; reason="Release Candidate enthÃ¤lt Provider Response oder Provider Result."; }
  else if(envelope.releaseCandidateContainsPromptPayload!==false || envelope.promptPayloadIncluded!==false || envelope.promptIncluded!==false){ decision="blocked_release_candidate_contains_prompt_payload"; reason="Release Candidate enthÃ¤lt Prompt Payload."; }
  else if(envelope.releaseCandidateContainsSecrets!==false || envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_release_candidate_contains_secrets"; reason="Release Candidate enthÃ¤lt Secret-Werte."; }
  else if(envelope.transcriptEnvelopeContainsProviderResponse!==false){ decision="blocked_transcript_contains_provider_response"; reason="Transcript enthÃ¤lt Provider Response."; }
  else if(envelope.transcriptEnvelopeContainsPromptPayload!==false){ decision="blocked_transcript_contains_prompt_payload"; reason="Transcript enthÃ¤lt Prompt Payload."; }
  else if(envelope.transcriptEnvelopeContainsSecrets!==false){ decision="blocked_transcript_contains_secrets"; reason="Transcript enthÃ¤lt Secrets."; }
  else if(envelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgefÃ¼hrt."; }
  else if(envelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(envelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(envelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgefÃ¼hrt."; }
  else if(envelope.provider!=="none" || envelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(envelope.networkCallAllowed!==false || envelope.networkCallPerformed!==false || envelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(envelope.dispatchPayloadIncluded!==false || envelope.commandPayloadIncluded!==false || envelope.requestBodyIncluded!==false || envelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const sim:ProviderDispatchReleaseCandidateEnvelopePolicySimulation={ id:makeId("provider-dispatch-release-candidate-envelope-policy-sim"), timestamp:new Date().toISOString(), providerDispatchReleaseCandidateEnvelopeId:envelope?.id||input.providerDispatchReleaseCandidateEnvelopeId, providerDispatchTranscriptEnvelopeId:envelope?.providerDispatchTranscriptEnvelopeId, providerDispatchDryRunResultEnvelopeId:envelope?.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:envelope?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:envelope?.providerDispatchExecutionGateId, decision, policyMode:"provider_dispatch_release_candidate_envelope_policy_human_review_only_no_provider_call", policyChecks:checks, providerDispatchReleaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePersisted:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included" && decision!=="blocked_release_candidate_contains_secrets" && decision!=="blocked_transcript_contains_secrets", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"40.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false } };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchReleaseCandidateEnvelopeId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Release Candidate Envelope Policy Simulation: "+sim.decision, metadata:{ source:"phase40.1-provider-dispatch-release-candidate-envelope-policy", simulationId:sim.id, providerDispatchReleaseCandidateEnvelopeId:sim.providerDispatchReleaseCandidateEnvelopeId, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchReleaseCandidateEnvelopePolicySimulations(sims:ProviderDispatchReleaseCandidateEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

