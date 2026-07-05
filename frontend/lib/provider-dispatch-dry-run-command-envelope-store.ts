import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchDryRunCommandEnvelopeDecision =
  | "provider_dispatch_dry_run_command_envelope_prepared_no_provider_call"
  | "blocked_missing_execution_gate"
  | "blocked_execution_gate_not_prepared"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchDryRunCommandEnvelope {
  id:string;
  timestamp:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchDryRunCommandEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_dry_run_command_envelope_no_provider_call";
  providerDispatchDryRunCommandEnvelopePrepared:true;
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
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-command-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchDryRunCommandEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchDryRunCommandEnvelopes(limit=100): ProviderDispatchDryRunCommandEnvelope[] {
  ensureStore();
  return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchDryRunCommandEnvelope(input:{ providerDispatchExecutionGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchDryRunCommandEnvelope {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.providerDispatchExecutionGateId ? gates.find((entry:any)=>entry.id===input.providerDispatchExecutionGateId) : gates[0];
  let decision:ProviderDispatchDryRunCommandEnvelopeDecision="provider_dispatch_dry_run_command_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Dry-Run Command Envelope wurde nur vorbereitet. Command Envelope wird nicht ausgeführt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_execution_gate"; reason="Provider Dispatch Execution Gate fehlt."; }
  else if(gate.providerDispatchExecutionGatePrepared!==true){ decision="blocked_execution_gate_not_prepared"; reason="Execution Gate ist nicht vorbereitet."; }
  else if(gate.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(gate.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(gate.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder ist nicht sicher false."; }
  else if(gate.tokenBoundToDispatch!==false || gate.tokenBindingActive!==false || gate.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(gate.provider!=="none" || gate.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(gate.dispatchPayloadIncluded!==false || gate.promptPayloadIncluded!==false || gate.promptIncluded!==false || gate.requestBodyIncluded!==false || gate.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(gate.secretValuesIncluded!==false || gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(gate.networkCallAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchDryRunCommandEnvelope={
    id:makeId("provider-dispatch-dry-run-command-envelope"), timestamp:new Date().toISOString(), providerDispatchExecutionGateId:gate?.id || input.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:gate?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:gate?.providerDispatchTokenBindingId, providerDispatchReadinessId:gate?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_dry_run_command_envelope_no_provider_call", providerDispatchDryRunCommandEnvelopePrepared:true, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"37.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchExecutionGateId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Dry-Run Command Envelope: "+envelope.decision, metadata:{ source:"phase37.0-provider-dispatch-dry-run-command-envelope", envelopeId:envelope.id, providerDispatchExecutionGateId:envelope.providerDispatchExecutionGateId, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchDryRunCommandEnvelopes(envelopes:ProviderDispatchDryRunCommandEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
