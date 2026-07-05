import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchFinalPreflightDecision =
  | "provider_dispatch_final_preflight_prepared_no_provider_call"
  | "blocked_missing_token_binding"
  | "blocked_token_binding_not_prepared"
  | "blocked_token_bound_or_active"
  | "blocked_dispatch_not_ready"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchFinalPreflight {
  id:string;
  timestamp:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchFinalPreflightDecision;
  preflightMode:"controlled_provider_dispatch_final_preflight_no_provider_call";
  providerDispatchFinalPreflightPrepared:true;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  providerDispatchTokenBindingPrepared:true;
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
function tokenBindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function preflightPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflights.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/?
/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPreflight(preflight:ProviderDispatchFinalPreflight): void { ensureStore(); appendFileSync(preflightPath(), JSON.stringify(preflight)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchFinalPreflights(limit=100): ProviderDispatchFinalPreflight[] {
  ensureStore();
  return readJsonl(preflightPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchFinalPreflight(input:{ providerDispatchTokenBindingId?: string; metadata?: Record<string, unknown> }): ProviderDispatchFinalPreflight {
  ensureStore();
  const bindings=readJsonl(tokenBindingPath());
  const binding=input.providerDispatchTokenBindingId ? bindings.find((entry:any)=>entry.id===input.providerDispatchTokenBindingId) : bindings[0];

  let decision:ProviderDispatchFinalPreflightDecision="provider_dispatch_final_preflight_prepared_no_provider_call";
  let reason="Provider Dispatch Final Preflight wurde nur vorbereitet. Final Dispatch bleibt nicht erlaubt. Kein Provider-/Netzwerk-Aufruf.";

  if(!binding){ decision="blocked_missing_token_binding"; reason="Provider Dispatch Token Binding fehlt."; }
  else if(binding.providerDispatchTokenBindingPrepared!==true){ decision="blocked_token_binding_not_prepared"; reason="Provider Dispatch Token Binding ist nicht vorbereitet."; }
  else if(binding.tokenBoundToDispatch!==false || binding.tokenBindingActive!==false || binding.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(binding.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_ready"; reason="Provider Dispatch Readiness ist nicht vorbereitet."; }
  else if(binding.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder nicht sicher false."; }
  else if(binding.provider!=="none" || binding.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(binding.dispatchPayloadIncluded!==false || binding.promptPayloadIncluded!==false || binding.requestBodyIncluded!==false || binding.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(binding.secretValuesIncluded!==false || binding.noSecretsIncluded!==true || containsSecretValue(binding)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(binding.networkCallPerformed!==false || binding.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(binding.executionAllowed!==false || binding.toolExecutionAllowed!==false || binding.agentExecutionAllowed!==false || binding.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const preflight:ProviderDispatchFinalPreflight={
    id:makeId("provider-dispatch-final-preflight"),
    timestamp:new Date().toISOString(),
    providerDispatchTokenBindingId:binding?.id || input.providerDispatchTokenBindingId,
    providerDispatchReadinessId:binding?.providerDispatchReadinessId,
    decision,
    preflightMode:"controlled_provider_dispatch_final_preflight_no_provider_call",
    providerDispatchFinalPreflightPrepared:true,
    finalDispatchAllowed:false,
    providerDispatchPerformed:false,
    providerDispatchTokenBindingPrepared:true,
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
    metadata:{ ...(input.metadata||{}), phase:"35.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, finalDispatchAllowed:false }
  };

  appendPreflight(preflight);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:preflight.providerDispatchTokenBindingId, status:preflight.decision, riskLevel:"critical", summary:"Provider Dispatch Final Preflight: "+preflight.decision, metadata:{ source:"phase35.0-provider-dispatch-final-preflight", preflightId:preflight.id, providerDispatchTokenBindingId:preflight.providerDispatchTokenBindingId, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return preflight;
}

export function summarizeProviderDispatchFinalPreflights(preflights:ProviderDispatchFinalPreflight[]){ const byDecision:Record<string,number>={}; for(const item of preflights){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:preflights.length, byDecision }; }
