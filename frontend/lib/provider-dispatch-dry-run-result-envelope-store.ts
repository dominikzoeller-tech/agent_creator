import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchDryRunResultEnvelopeDecision =
  | "provider_dispatch_dry_run_result_envelope_prepared_no_provider_call"
  | "blocked_missing_dry_run_command_envelope"
  | "blocked_dry_run_command_envelope_not_prepared"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchDryRunResultEnvelope {
  id:string;
  timestamp:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchDryRunResultEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_dry_run_result_envelope_no_provider_call";
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
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function commandEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-command-envelopes.jsonl"); }
function resultEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchDryRunResultEnvelope): void { ensureStore(); appendFileSync(resultEnvelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchDryRunResultEnvelopes(limit=100): ProviderDispatchDryRunResultEnvelope[] {
  ensureStore();
  return readJsonl(resultEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchDryRunResultEnvelope(input:{ providerDispatchDryRunCommandEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchDryRunResultEnvelope {
  ensureStore();
  const envelopes=readJsonl(commandEnvelopePath());
  const commandEnvelope=input.providerDispatchDryRunCommandEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchDryRunCommandEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchDryRunResultEnvelopeDecision="provider_dispatch_dry_run_result_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Dry-Run Result Envelope wurde nur vorbereitet. Es enthÃ¤lt keine Provider Response. Kein Provider-/Netzwerk-Aufruf.";
  if(!commandEnvelope){ decision="blocked_missing_dry_run_command_envelope"; reason="Provider Dispatch Dry-Run Command Envelope fehlt."; }
  else if(commandEnvelope.providerDispatchDryRunCommandEnvelopePrepared!==true || commandEnvelope.commandEnvelopePrepared!==true){ decision="blocked_dry_run_command_envelope_not_prepared"; reason="Dry-Run Command Envelope ist nicht vorbereitet."; }
  else if(commandEnvelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgefÃ¼hrt."; }
  else if(commandEnvelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(commandEnvelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(commandEnvelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgefÃ¼hrt oder ist nicht sicher false."; }
  else if(commandEnvelope.provider!=="none" || commandEnvelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(commandEnvelope.dispatchPayloadIncluded!==false || commandEnvelope.commandPayloadIncluded!==false || commandEnvelope.promptPayloadIncluded!==false || commandEnvelope.promptIncluded!==false || commandEnvelope.requestBodyIncluded!==false || commandEnvelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Command-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(commandEnvelope.secretValuesIncluded!==false || commandEnvelope.noSecretsIncluded!==true || containsSecretValue(commandEnvelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(commandEnvelope.networkCallAllowed!==false || commandEnvelope.networkCallPerformed!==false || commandEnvelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-AusfÃ¼hrung erkannt."; }
  else if(commandEnvelope.executionAllowed!==false || commandEnvelope.toolExecutionAllowed!==false || commandEnvelope.agentExecutionAllowed!==false || commandEnvelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchDryRunResultEnvelope={
    id:makeId("provider-dispatch-dry-run-result-envelope"), timestamp:new Date().toISOString(), providerDispatchDryRunCommandEnvelopeId:commandEnvelope?.id || input.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:commandEnvelope?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:commandEnvelope?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:commandEnvelope?.providerDispatchTokenBindingId, providerDispatchReadinessId:commandEnvelope?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_dry_run_result_envelope_no_provider_call", providerDispatchDryRunResultEnvelopePrepared:true, resultEnvelopePrepared:true, resultEnvelopePersisted:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"38.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, commandEnvelopeExecuted:false, resultEnvelopeContainsProviderResponse:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchDryRunCommandEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Dry-Run Result Envelope: "+envelope.decision, metadata:{ source:"phase38.0-provider-dispatch-dry-run-result-envelope", envelopeId:envelope.id, providerDispatchDryRunCommandEnvelopeId:envelope.providerDispatchDryRunCommandEnvelopeId, resultEnvelopeContainsProviderResponse:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchDryRunResultEnvelopes(envelopes:ProviderDispatchDryRunResultEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }

