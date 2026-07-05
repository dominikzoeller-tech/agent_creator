import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestContractDecision =
  | "provider_request_contract_prepared_no_provider_call"
  | "blocked_missing_token_backed_preflight"
  | "blocked_preflight_not_prepared"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestContract {
  id: string;
  timestamp: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: ProviderRequestContractDecision;
  contractMode: "controlled_provider_request_contract_metadata_only_no_provider_call";
  contractChecks: Array<{ name: string; passed: boolean; reason: string }>;
  requestContract: {
    provider: "none";
    modelSelected: "none";
    promptIncluded: false;
    promptRedactedPreviewIncluded: false;
    secretValuesIncluded: false;
    requestBodyIncluded: false;
    metadataOnly: true;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  providerRequestContractPrepared: true;
  tokenBackedPreflightPrepared: true;
  tokenActive: false;
  provider: "none";
  modelSelected: "none";
  promptIncluded: false;
  promptRedactedPreviewIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  metadataOnly: true;
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
function preflightPath(): string { return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendContract(item: ProviderRequestContract): void { ensureStore(); appendFileSync(contractPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestContracts(limit=100): ProviderRequestContract[] { ensureStore(); return readJsonl(contractPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderRequestContract(input:{ tokenBackedPreflightId?: string; metadata?: Record<string, unknown> }): ProviderRequestContract {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.tokenBackedPreflightId ? preflights.find((entry:any)=>entry.id===input.tokenBackedPreflightId) : preflights[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"token_backed_preflight_exists", passed:Boolean(preflight), reason:preflight?"Token-backed Provider Preflight gefunden.":"Token-backed Provider Preflight fehlt." });
  checks.push({ name:"token_backed_preflight_prepared", passed:preflight?.tokenBackedPreflightPrepared===true, reason:"Token-backed Preflight muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:preflight?.tokenActive===false, reason:"Provider Request Contract darf Token nicht aktiv setzen." });
  checks.push({ name:"provider_none", passed:preflight?.provider==="none" && preflight?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_not_included", passed:preflight?.promptIncluded===false, reason:"Prompt darf nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:preflight?.secretValuesIncluded===false && preflight?.noSecretsIncluded===true && !containsSecretValue(preflight), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:true, reason:"Request Body wird in Phase 31.0 nicht eingebettet." });
  checks.push({ name:"metadata_only_contract", passed:true, reason:"Provider Request Contract bleibt metadata-only." });
  checks.push({ name:"network_provider_blocked", passed:preflight?.networkCallPerformed===false && preflight?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:preflight?.realLlmCallAllowed===false && preflight?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed===false && preflight?.toolExecutionAllowed===false && preflight?.agentExecutionAllowed===false && preflight?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestContractDecision="provider_request_contract_prepared_no_provider_call";
  let reason="Provider Request Contract metadata-only vorbereitet. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte, kein Request Body.";
  if(!preflight){ decision="blocked_missing_token_backed_preflight"; reason="Token-backed Provider Preflight fehlt."; }
  else if(preflight.tokenBackedPreflightPrepared!==true){ decision="blocked_preflight_not_prepared"; reason="Token-backed Provider Preflight ist nicht vorbereitet."; }
  else if(preflight.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false."; }
  else if(preflight.promptIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true || containsSecretValue(preflight)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:ProviderRequestContract={
    id:makeId("provider-request-contract"), timestamp:new Date().toISOString(), tokenBackedPreflightId:preflight?.id||input.tokenBackedPreflightId, activationGateId:preflight?.activationGateId, issuanceGateId:preflight?.issuanceGateId, approvalTokenRequestId:preflight?.approvalTokenRequestId, decision,
    contractMode:"controlled_provider_request_contract_metadata_only_no_provider_call", contractChecks:checks,
    requestContract:{ provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, metadataOnly:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerRequestContractPrepared:true, tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, metadataOnly:true,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"31.0", providerRequestContractOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptIncluded:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendContract(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Request Contract prepared: "+item.decision, metadata:{ source:"phase31.0-provider-request-contract", contractId:item.id, tokenBackedPreflightId:item.tokenBackedPreflightId, metadataOnly:true, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderRequestContracts(items:ProviderRequestContract[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
