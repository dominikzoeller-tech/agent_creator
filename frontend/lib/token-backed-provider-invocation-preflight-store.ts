import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type TokenBackedProviderInvocationPreflightDecision =
  | "token_backed_provider_invocation_preflight_prepared_no_provider_call"
  | "blocked_missing_activation_gate"
  | "blocked_token_not_activation_prepared"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_activation_intent_missing"
  | "blocked_secret_boundary_violation"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface TokenBackedProviderInvocationPreflight {
  id: string;
  timestamp: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: TokenBackedProviderInvocationPreflightDecision;
  preflightMode: "controlled_token_backed_provider_invocation_preflight_no_provider_call";
  preflightChecks: Array<{ name: string; passed: boolean; reason: string }>;
  tokenState: {
    approvalTokenRequested: true;
    approvalTokenIssuancePrepared: true;
    tokenActivationPrepared: true;
    tokenActive: false;
    activationIntentRecorded: boolean;
  };
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
    tokenBackedInvocationAllowed: false;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  tokenBackedPreflightPrepared: true;
  tokenActive: false;
  provider: "none";
  modelSelected: "none";
  promptIncluded: false;
  secretValuesIncluded: false;
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
function activationGatePath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function preflightPath(): string { return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPreflight(item: TokenBackedProviderInvocationPreflight): void { ensureStore(); appendFileSync(preflightPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listTokenBackedProviderInvocationPreflights(limit=100): TokenBackedProviderInvocationPreflight[] { ensureStore(); return readJsonl(preflightPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createTokenBackedProviderInvocationPreflight(input:{ activationGateId?: string; metadata?: Record<string, unknown> }): TokenBackedProviderInvocationPreflight {
  ensureStore();
  const gates=readJsonl(activationGatePath());
  const gate=input.activationGateId ? gates.find((entry:any)=>entry.id===input.activationGateId) : gates[0];
  const state=gate?.activationState || {};
  const plan=gate?.providerCallPlan || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"activation_gate_exists", passed:Boolean(gate), reason:gate?"Approval Token Activation Gate gefunden.":"Approval Token Activation Gate fehlt." });
  checks.push({ name:"token_activation_prepared", passed:state.tokenActivationPrepared===true || gate?.tokenActivationPrepared===true, reason:"Token Activation muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:state.tokenActive===false && gate?.tokenActive===false, reason:"Token-backed Provider Preflight darf Token nicht aktiv setzen." });
  checks.push({ name:"activation_intent_recorded", passed:state.activationIntentRecorded===true || gate?.activationIntentRecorded===true, reason:"Activation Intent muss vorhanden sein." });
  checks.push({ name:"provider_selection_blocked", passed:plan.providerSelectionAllowed===false && plan.provider==="none" && plan.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"network_blocked", passed:plan.networkCallAllowed===false && plan.automaticInvocationAllowed===false && gate?.networkCallPerformed===false && gate?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded===true && !containsSecretValue(gate), reason:"Keine Secret-Werte im Preflight." });
  checks.push({ name:"prompt_not_included", passed:true, reason:"Prompt wird in Phase 30.0 nicht eingebettet." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed===false && gate?.toolExecutionAllowed===false && gate?.agentExecutionAllowed===false && gate?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:TokenBackedProviderInvocationPreflightDecision="token_backed_provider_invocation_preflight_prepared_no_provider_call";
  let reason="Token-backed Provider Invocation Preflight vorbereitet. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte.";
  if(!gate){ decision="blocked_missing_activation_gate"; reason="Approval Token Activation Gate fehlt."; }
  else if(!(state.tokenActivationPrepared===true || gate.tokenActivationPrepared===true)){ decision="blocked_token_not_activation_prepared"; reason="Token Activation ist nicht vorbereitet."; }
  else if(state.tokenActive!==false || gate.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false. Phase 30.0 ist Preflight-only."; }
  else if(!(state.activationIntentRecorded===true || gate.activationIntentRecorded===true)){ decision="blocked_activation_intent_missing"; reason="Activation Intent fehlt."; }
  else if(gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(plan.providerSelectionAllowed!==false || plan.provider!=="none" || plan.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(plan.networkCallAllowed!==false || plan.automaticInvocationAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:TokenBackedProviderInvocationPreflight={
    id:makeId("token-backed-provider-preflight"), timestamp:new Date().toISOString(), activationGateId:gate?.id || input.activationGateId, issuanceGateId:gate?.issuanceGateId, approvalTokenRequestId:gate?.approvalTokenRequestId, decision, preflightMode:"controlled_token_backed_provider_invocation_preflight_no_provider_call", preflightChecks:checks,
    tokenState:{ approvalTokenRequested:true, approvalTokenIssuancePrepared:true, tokenActivationPrepared:true, tokenActive:false, activationIntentRecorded:state.activationIntentRecorded===true || gate?.activationIntentRecorded===true },
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, tokenBackedInvocationAllowed:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_boundary_violation", reason,
    metadata:{ ...(input.metadata||{}), phase:"30.0", tokenBackedProviderPreflightOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptIncluded:true, noSecretsIncluded:decision!=="blocked_secret_boundary_violation" }
  };
  appendPreflight(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Token-backed Provider Invocation Preflight prepared: "+item.decision, metadata:{ source:"phase30.0-token-backed-provider-preflight", preflightId:item.id, activationGateId:item.activationGateId, tokenActive:false, promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeTokenBackedProviderInvocationPreflights(items:TokenBackedProviderInvocationPreflight[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
