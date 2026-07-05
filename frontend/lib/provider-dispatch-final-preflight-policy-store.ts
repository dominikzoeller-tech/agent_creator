import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchFinalPreflightPolicyDecision =
  | "provider_dispatch_final_preflight_policy_allowed_no_provider_call"
  | "blocked_missing_final_preflight"
  | "blocked_final_preflight_not_prepared"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchFinalPreflightPolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchFinalPreflightPolicyDecision;
  policyMode:"provider_dispatch_final_preflight_policy_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function preflightPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflights.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflight-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchFinalPreflightPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchFinalPreflightPolicySimulations(limit=100): ProviderDispatchFinalPreflightPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderDispatchFinalPreflightPolicy(input:{ providerDispatchFinalPreflightId?: string; metadata?: Record<string, unknown> }): ProviderDispatchFinalPreflightPolicySimulation {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.providerDispatchFinalPreflightId ? preflights.find((entry:any)=>entry.id===input.providerDispatchFinalPreflightId) : preflights[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"final_preflight_exists", passed:Boolean(preflight), reason:preflight?"Provider Dispatch Final Preflight gefunden.":"Provider Dispatch Final Preflight fehlt." });
  checks.push({ name:"final_preflight_prepared", passed:preflight?.providerDispatchFinalPreflightPrepared===true, reason:"Final Preflight muss nur vorbereitet sein." });
  checks.push({ name:"final_dispatch_not_allowed", passed:preflight?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:preflight?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgefÃ¼hrt sein." });
  checks.push({ name:"token_not_bound_or_active", passed:preflight?.tokenBoundToDispatch===false && preflight?.tokenBindingActive===false && preflight?.tokenActive===false, reason:"Token darf nicht gebunden oder aktiv sein." });
  checks.push({ name:"metadata_only", passed:preflight?.metadataOnly===true, reason:"Final Preflight bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:preflight?.provider==="none" && preflight?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:preflight?.dispatchPayloadIncluded===false && preflight?.promptPayloadIncluded===false && preflight?.promptIncluded===false && preflight?.requestBodyIncluded===false && preflight?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Prompt- und Request-Payloads dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:preflight?.secretValuesIncluded===false && preflight?.noSecretsIncluded===true && !containsSecretValue(preflight), reason:"Secret-Werte dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:preflight?.networkCallAllowed===false && preflight?.networkCallPerformed===false && preflight?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:preflight?.realLlmCallAllowed===false && preflight?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed===false && preflight?.toolExecutionAllowed===false && preflight?.agentExecutionAllowed===false && preflight?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  let decision:ProviderDispatchFinalPreflightPolicyDecision="provider_dispatch_final_preflight_policy_allowed_no_provider_call";
  let reason="Provider Dispatch Final Preflight Policy erlaubt nur no-provider-call Simulation. Final Dispatch bleibt blockiert.";
  if(!preflight){ decision="blocked_missing_final_preflight"; reason="Provider Dispatch Final Preflight fehlt."; }
  else if(preflight.providerDispatchFinalPreflightPrepared!==true){ decision="blocked_final_preflight_not_prepared"; reason="Final Preflight ist nicht vorbereitet."; }
  else if(preflight.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(preflight.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgefÃ¼hrt."; }
  else if(preflight.tokenBoundToDispatch!==false || preflight.tokenBindingActive!==false || preflight.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden oder aktiv."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.networkCallAllowed!==false || preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(preflight.dispatchPayloadIncluded!==false || preflight.promptPayloadIncluded!==false || preflight.promptIncluded!==false || preflight.requestBodyIncluded!==false || preflight.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true || containsSecretValue(preflight)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchFinalPreflightPolicySimulation={ id:makeId("provider-dispatch-final-preflight-policy-sim"), timestamp:new Date().toISOString(), providerDispatchFinalPreflightId:preflight?.id||input.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:preflight?.providerDispatchTokenBindingId, providerDispatchReadinessId:preflight?.providerDispatchReadinessId, decision, policyMode:"provider_dispatch_final_preflight_policy_no_provider_call", policyChecks:checks, providerDispatchFinalPreflightPrepared:true, finalDispatchAllowed:false, providerDispatchPerformed:false, providerDispatchTokenBindingPrepared:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"35.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, finalDispatchAllowed:false } };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchFinalPreflightId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Final Preflight Policy Simulation: "+sim.decision, metadata:{ source:"phase35.1-provider-dispatch-final-preflight-policy", simulationId:sim.id, providerDispatchFinalPreflightId:sim.providerDispatchFinalPreflightId, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchFinalPreflightPolicySimulations(sims:ProviderDispatchFinalPreflightPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

