import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchExecutionGateDecision =
  | "provider_dispatch_execution_gate_prepared_execution_blocked_no_provider_call"
  | "blocked_missing_final_preflight"
  | "blocked_final_preflight_not_prepared"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchExecutionGate {
  id:string;
  timestamp:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchExecutionGateDecision;
  gateMode:"controlled_provider_dispatch_execution_gate_no_provider_call";
  providerDispatchExecutionGatePrepared:true;
  executionGateOpen:false;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  providerDispatchFinalPreflightPrepared:true;
  tokenBoundToDispatch:false;
  tokenBindingActive:false;
  tokenActive:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
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
function finalPreflightPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflights.jsonl"); }
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/?
/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate:ProviderDispatchExecutionGate): void { ensureStore(); appendFileSync(gatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchExecutionGates(limit=100): ProviderDispatchExecutionGate[] {
  ensureStore();
  return readJsonl(gatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchExecutionGate(input:{ providerDispatchFinalPreflightId?: string; metadata?: Record<string, unknown> }): ProviderDispatchExecutionGate {
  ensureStore();
  const preflights=readJsonl(finalPreflightPath());
  const preflight=input.providerDispatchFinalPreflightId ? preflights.find((entry:any)=>entry.id===input.providerDispatchFinalPreflightId) : preflights[0];

  let decision:ProviderDispatchExecutionGateDecision="provider_dispatch_execution_gate_prepared_execution_blocked_no_provider_call";
  let reason="Provider Dispatch Execution Gate wurde nur vorbereitet. Execution Gate bleibt geschlossen. Kein Provider-/Netzwerk-Aufruf.";

  if(!preflight){ decision="blocked_missing_final_preflight"; reason="Provider Dispatch Final Preflight fehlt."; }
  else if(preflight.providerDispatchFinalPreflightPrepared!==true){ decision="blocked_final_preflight_not_prepared"; reason="Final Preflight ist nicht vorbereitet."; }
  else if(preflight.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(preflight.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder nicht sicher false."; }
  else if(preflight.tokenBoundToDispatch!==false || preflight.tokenBindingActive!==false || preflight.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.dispatchPayloadIncluded!==false || preflight.promptPayloadIncluded!==false || preflight.promptIncluded!==false || preflight.requestBodyIncluded!==false || preflight.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true || containsSecretValue(preflight)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.networkCallAllowed!==false || preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const gate:ProviderDispatchExecutionGate={
    id:makeId("provider-dispatch-execution-gate"),
    timestamp:new Date().toISOString(),
    providerDispatchFinalPreflightId:preflight?.id || input.providerDispatchFinalPreflightId,
    providerDispatchTokenBindingId:preflight?.providerDispatchTokenBindingId,
    providerDispatchReadinessId:preflight?.providerDispatchReadinessId,
    decision,
    gateMode:"controlled_provider_dispatch_execution_gate_no_provider_call",
    providerDispatchExecutionGatePrepared:true,
    executionGateOpen:false,
    finalDispatchAllowed:false,
    providerDispatchPerformed:false,
    providerDispatchFinalPreflightPrepared:true,
    tokenBoundToDispatch:false,
    tokenBindingActive:false,
    tokenActive:false,
    metadataOnly:true,
    provider:"none",
    modelSelected:"none",
    dispatchPayloadIncluded:false,
    promptPayloadIncluded:false,
    promptIncluded:false,
    secretValuesIncluded:false,
    requestBodyIncluded:false,
    sensitiveRequestBodyIncluded:false,
    networkCallAllowed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision!=="blocked_secret_values_included",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"36.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, executionGateOpen:false, finalDispatchAllowed:false }
  };

  appendGate(gate);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:gate.providerDispatchFinalPreflightId, status:gate.decision, riskLevel:"critical", summary:"Provider Dispatch Execution Gate: "+gate.decision, metadata:{ source:"phase36.0-provider-dispatch-execution-gate", gateId:gate.id, providerDispatchFinalPreflightId:gate.providerDispatchFinalPreflightId, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return gate;
}

export function summarizeProviderDispatchExecutionGates(gates:ProviderDispatchExecutionGate[]){ const byDecision:Record<string,number>={}; for(const item of gates){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:gates.length, byDecision }; }
