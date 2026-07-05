import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type TokenBackedProviderPreflightPolicyDecision =
  | "token_backed_provider_preflight_policy_allowed_no_provider_call"
  | "blocked_missing_token_backed_preflight"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";
export interface TokenBackedProviderPreflightPolicySimulation {
  id:string; timestamp:string; preflightId?:string; activationGateId?:string; issuanceGateId?:string; approvalTokenRequestId?:string;
  decision: TokenBackedProviderPreflightPolicyDecision;
  policyMode:"token_backed_provider_preflight_policy_no_provider_call";
  policyChecks:Array<{name:string;passed:boolean;reason:string}>;
  tokenBackedPreflightPrepared:true; tokenActive:false; provider:"none"; modelSelected:"none"; promptIncluded:false; secretValuesIncluded:false;
  networkCallPerformed:false; providerExecutionAllowed:false; realLlmCallAllowed:false; llmCallPerformed:false;
  executionAllowed:false; toolExecutionAllowed:false; agentExecutionAllowed:false; dryRunOnly:true; noSecretsIncluded:boolean; simulated:true; reason:string; metadata?:Record<string, unknown>;
}
function dataDir(){ return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function preflightPath(){ return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function simulationPath(){ return path.join(dataDir(), "token-backed-provider-preflight-policy-simulations.jsonl"); }
function ensureStore(){ mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string){ const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:TokenBackedProviderPreflightPolicySimulation){ ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
export function listTokenBackedProviderPreflightPolicySimulations(limit=100): TokenBackedProviderPreflightPolicySimulation[]{ ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateTokenBackedProviderPreflightPolicy(input:{ preflightId?:string; metadata?:Record<string, unknown> }):TokenBackedProviderPreflightPolicySimulation{
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const checks:Array<{name:string;passed:boolean;reason:string}>=[];
  checks.push({name:"preflight_exists",passed:Boolean(preflight),reason:preflight?"Token-backed Provider Preflight gefunden.":"Token-backed Provider Preflight fehlt."});
  checks.push({name:"preflight_mode_no_provider_call",passed:preflight?.preflightMode==="controlled_token_backed_provider_invocation_preflight_no_provider_call",reason:"Preflight muss No-Provider-Call bleiben."});
  checks.push({name:"token_backed_preflight_prepared",passed:preflight?.tokenBackedPreflightPrepared===true,reason:"Token-backed Preflight muss vorbereitet sein."});
  checks.push({name:"token_not_active",passed:preflight?.tokenActive===false,reason:"Token darf in Phase 30.1 nicht aktiv sein."});
  checks.push({name:"provider_none",passed:preflight?.provider==="none" && preflight?.modelSelected==="none",reason:"Provider und Modell bleiben none."});
  checks.push({name:"prompt_not_included",passed:preflight?.promptIncluded===false,reason:"Prompt darf nicht enthalten sein."});
  checks.push({name:"secrets_not_included",passed:preflight?.secretValuesIncluded===false && preflight?.noSecretsIncluded===true,reason:"Secret-Werte dÃ¼rfen nicht enthalten sein."});
  checks.push({name:"network_provider_blocked",passed:preflight?.networkCallPerformed===false && preflight?.providerExecutionAllowed===false,reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert."});
  checks.push({name:"llm_blocked",passed:preflight?.realLlmCallAllowed===false && preflight?.llmCallPerformed===false,reason:"Real LLM Call bleibt blockiert."});
  checks.push({name:"execution_blocked",passed:preflight?.executionAllowed===false && preflight?.toolExecutionAllowed===false && preflight?.agentExecutionAllowed===false && preflight?.dryRunOnly===true,reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert."});
  let decision:TokenBackedProviderPreflightPolicyDecision="token_backed_provider_preflight_policy_allowed_no_provider_call";
  let reason="Token-backed Provider Preflight Policy erlaubt nur Simulation. Kein Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_token_backed_preflight"; reason="Token-backed Provider Preflight fehlt."; }
  else if(preflight.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false."; }
  else if(preflight.promptIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:TokenBackedProviderPreflightPolicySimulation={
    id:makeId("token-backed-provider-policy-sim"), timestamp:new Date().toISOString(), preflightId:preflight?.id||input.preflightId, activationGateId:preflight?.activationGateId, issuanceGateId:preflight?.issuanceGateId, approvalTokenRequestId:preflight?.approvalTokenRequestId,
    decision, policyMode:"token_backed_provider_preflight_policy_no_provider_call", policyChecks:checks,
    tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, secretValuesIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{...(input.metadata||{}), phase:"30.1", tokenBackedProviderPreflightPolicyOnly:true, noNetworkCall:true, noProviderCall:true, noPromptIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included"}
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.preflightId, status:sim.decision, riskLevel:"critical", summary:"Token-backed Provider Preflight Policy Simulation: "+sim.decision, metadata:{ source:"phase30.1-token-backed-provider-preflight-policy", simulationId:sim.id, preflightId:sim.preflightId, tokenActive:false, promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeTokenBackedProviderPreflightPolicySimulations(sims:TokenBackedProviderPreflightPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

