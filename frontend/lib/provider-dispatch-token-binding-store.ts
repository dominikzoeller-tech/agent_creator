import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTokenBindingDecision =
  | "provider_dispatch_token_binding_prepared_no_provider_call"
  | "blocked_missing_dispatch_readiness"
  | "blocked_dispatch_not_prepared"
  | "blocked_dispatch_already_performed"
  | "blocked_token_not_active"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_prompt_or_payload_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTokenBinding {
  id:string;
  timestamp:string;
  providerDispatchReadinessId?:string;
  tokenActivationGateId?:string;
  decision:ProviderDispatchTokenBindingDecision;
  bindingMode:"controlled_provider_dispatch_token_binding_no_provider_call";
  providerDispatchTokenBindingPrepared:true;
  tokenBoundToDispatch:false;
  tokenBindingActive:false;
  tokenActive:false;
  providerDispatchPrepared:true;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
  promptPayloadIncluded:false;
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
  reason:string;
  metadata?:Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function activationPath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendBinding(binding:ProviderDispatchTokenBinding): void { ensureStore(); appendFileSync(bindingPath(), JSON.stringify(binding)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchTokenBindings(limit=100): ProviderDispatchTokenBinding[] {
  ensureStore();
  return readJsonl(bindingPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchTokenBinding(input:{ providerDispatchReadinessId?: string; tokenActivationGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTokenBinding {
  ensureStore();
  const readinessItems=readJsonl(readinessPath());
  const activationItems=readJsonl(activationPath());
  const readiness=input.providerDispatchReadinessId ? readinessItems.find((entry:any)=>entry.id===input.providerDispatchReadinessId) : readinessItems[0];
  const activation=input.tokenActivationGateId ? activationItems.find((entry:any)=>entry.id===input.tokenActivationGateId) : activationItems[0];

  let decision:ProviderDispatchTokenBindingDecision="provider_dispatch_token_binding_prepared_no_provider_call";
  let reason="Provider Dispatch Token Binding wurde nur vorbereitet. Token bleibt nicht aktiv gebunden. Kein Provider Dispatch und kein Netzwerkaufruf.";

  if(!readiness){ decision="blocked_missing_dispatch_readiness"; reason="Provider Dispatch Readiness fehlt."; }
  else if(readiness.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_prepared"; reason="Provider Dispatch ist nicht vorbereitet."; }
  else if(readiness.providerDispatchPerformed!==false){ decision="blocked_dispatch_already_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder Status ist nicht false."; }
  else if(activation && activation.tokenActive!==false){ decision="blocked_token_not_active"; reason="Token-Status ist nicht explizit false im No-Provider-Call-Pfad."; }
  else if(readiness.provider!=="none" || readiness.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(readiness.networkCallPerformed!==false || readiness.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(readiness.dispatchPayloadIncluded!==false || readiness.promptPayloadIncluded!==false || readiness.requestBodyIncluded!==false || readiness.sensitiveRequestBodyIncluded!==false){ decision="blocked_prompt_or_payload_included"; reason="Dispatch-, Prompt- oder Request-Payload ist enthalten."; }
  else if(readiness.secretValuesIncluded!==false || readiness.noSecretsIncluded!==true || containsSecretValue(readiness)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(readiness.executionAllowed!==false || readiness.toolExecutionAllowed!==false || readiness.agentExecutionAllowed!==false || readiness.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const binding:ProviderDispatchTokenBinding={
    id:makeId("provider-dispatch-token-binding"),
    timestamp:new Date().toISOString(),
    providerDispatchReadinessId:readiness?.id || input.providerDispatchReadinessId,
    tokenActivationGateId:activation?.id || input.tokenActivationGateId,
    decision,
    bindingMode:"controlled_provider_dispatch_token_binding_no_provider_call",
    providerDispatchTokenBindingPrepared:true,
    tokenBoundToDispatch:false,
    tokenBindingActive:false,
    tokenActive:false,
    providerDispatchPrepared:true,
    providerDispatchPerformed:false,
    metadataOnly:true,
    provider:"none",
    modelSelected:"none",
    dispatchPayloadIncluded:false,
    promptPayloadIncluded:false,
    secretValuesIncluded:false,
    requestBodyIncluded:false,
    sensitiveRequestBodyIncluded:false,
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
    metadata:{ ...(input.metadata||{}), phase:"34.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, tokenBoundToDispatch:false, tokenBindingActive:false }
  };

  appendBinding(binding);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:binding.providerDispatchReadinessId, status:binding.decision, riskLevel:"critical", summary:"Provider Dispatch Token Binding: "+binding.decision, metadata:{ source:"phase34.0-provider-dispatch-token-binding", bindingId:binding.id, providerDispatchReadinessId:binding.providerDispatchReadinessId, tokenActivationGateId:binding.tokenActivationGateId, providerDispatchTokenBindingPrepared:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });

  return binding;
}

export function summarizeProviderDispatchTokenBindings(bindings:ProviderDispatchTokenBinding[]){ const byDecision:Record<string,number>={}; for(const binding of bindings){ byDecision[binding.decision]=(byDecision[binding.decision]||0)+1; } return { total:bindings.length, byDecision }; }
