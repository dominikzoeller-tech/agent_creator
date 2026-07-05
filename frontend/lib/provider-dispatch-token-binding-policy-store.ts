import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTokenBindingPolicyDecision =
  | "provider_dispatch_token_binding_policy_allowed_no_provider_call"
  | "blocked_missing_token_binding"
  | "blocked_binding_not_prepared"
  | "blocked_token_bound_or_active"
  | "blocked_token_active"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_prompt_or_payload_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTokenBindingPolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  tokenActivationGateId?:string;
  decision:ProviderDispatchTokenBindingPolicyDecision;
  policyMode:"provider_dispatch_token_binding_policy_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-token-binding-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchTokenBindingPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchTokenBindingPolicySimulations(limit=100): ProviderDispatchTokenBindingPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderDispatchTokenBindingPolicy(input:{ providerDispatchTokenBindingId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTokenBindingPolicySimulation {
  ensureStore();
  const bindings=readJsonl(bindingPath());
  const binding=input.providerDispatchTokenBindingId ? bindings.find((entry:any)=>entry.id===input.providerDispatchTokenBindingId) : bindings[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"binding_exists", passed:Boolean(binding), reason:binding?"Provider Dispatch Token Binding gefunden.":"Provider Dispatch Token Binding fehlt." });
  checks.push({ name:"binding_prepared", passed:binding?.providerDispatchTokenBindingPrepared===true, reason:"Token Binding muss nur vorbereitet sein." });
  checks.push({ name:"token_not_bound_or_active", passed:binding?.tokenBoundToDispatch===false && binding?.tokenBindingActive===false && binding?.tokenActive===false, reason:"Token darf nicht aktiv gebunden sein." });
  checks.push({ name:"dispatch_not_performed", passed:binding?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgefÃ¼hrt sein." });
  checks.push({ name:"metadata_only", passed:binding?.metadataOnly===true, reason:"Binding bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:binding?.provider==="none" && binding?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:binding?.dispatchPayloadIncluded===false && binding?.promptPayloadIncluded===false && binding?.requestBodyIncluded===false && binding?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Prompt- und Request-Payloads dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:binding?.secretValuesIncluded===false && binding?.noSecretsIncluded===true && !containsSecretValue(binding), reason:"Secret-Werte dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:binding?.networkCallPerformed===false && binding?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:binding?.realLlmCallAllowed===false && binding?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:binding?.executionAllowed===false && binding?.toolExecutionAllowed===false && binding?.agentExecutionAllowed===false && binding?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  let decision:ProviderDispatchTokenBindingPolicyDecision="provider_dispatch_token_binding_policy_allowed_no_provider_call";
  let reason="Provider Dispatch Token Binding Policy erlaubt nur no-provider-call Simulation. Token bleibt nicht aktiv gebunden.";
  if(!binding){ decision="blocked_missing_token_binding"; reason="Provider Dispatch Token Binding fehlt."; }
  else if(binding.providerDispatchTokenBindingPrepared!==true){ decision="blocked_binding_not_prepared"; reason="Provider Dispatch Token Binding ist nicht vorbereitet."; }
  else if(binding.tokenBoundToDispatch!==false || binding.tokenBindingActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden oder Binding aktiv."; }
  else if(binding.tokenActive!==false){ decision="blocked_token_active"; reason="Token ist aktiv."; }
  else if(binding.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgefÃ¼hrt."; }
  else if(binding.provider!=="none" || binding.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(binding.networkCallPerformed!==false || binding.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(binding.dispatchPayloadIncluded!==false || binding.promptPayloadIncluded!==false || binding.requestBodyIncluded!==false || binding.sensitiveRequestBodyIncluded!==false){ decision="blocked_prompt_or_payload_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(binding.secretValuesIncluded!==false || binding.noSecretsIncluded!==true || containsSecretValue(binding)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(binding.executionAllowed!==false || binding.toolExecutionAllowed!==false || binding.agentExecutionAllowed!==false || binding.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchTokenBindingPolicySimulation={ id:makeId("provider-dispatch-token-binding-policy-sim"), timestamp:new Date().toISOString(), providerDispatchTokenBindingId:binding?.id||input.providerDispatchTokenBindingId, providerDispatchReadinessId:binding?.providerDispatchReadinessId, tokenActivationGateId:binding?.tokenActivationGateId, decision, policyMode:"provider_dispatch_token_binding_policy_no_provider_call", policyChecks:checks, providerDispatchTokenBindingPrepared:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"34.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false } };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchTokenBindingId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Token Binding Policy Simulation: "+sim.decision, metadata:{ source:"phase34.1-provider-dispatch-token-binding-policy", simulationId:sim.id, providerDispatchTokenBindingId:sim.providerDispatchTokenBindingId, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchTokenBindingPolicySimulations(sims:ProviderDispatchTokenBindingPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

