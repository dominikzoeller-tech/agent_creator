import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestContractPolicyDecision =
  | "provider_request_contract_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_request_contract"
  | "blocked_contract_not_prepared"
  | "blocked_not_metadata_only"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestContractPolicySimulation {
  id:string;
  timestamp:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  activationGateId?:string;
  issuanceGateId?:string;
  decision:ProviderRequestContractPolicyDecision;
  policyMode:"provider_request_contract_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerRequestContractPrepared:true;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  promptIncluded:false;
  promptRedactedPreviewIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
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
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-request-contract-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderRequestContractPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestContractPolicySimulations(limit=100): ProviderRequestContractPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderRequestContractPolicy(input:{ providerRequestContractId?: string; metadata?: Record<string, unknown> }): ProviderRequestContractPolicySimulation {
  ensureStore();
  const contracts=readJsonl(contractPath());
  const contract=input.providerRequestContractId ? contracts.find((entry:any)=>entry.id===input.providerRequestContractId) : contracts[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"contract_exists", passed:Boolean(contract), reason:contract?"Provider Request Contract gefunden.":"Provider Request Contract fehlt." });
  checks.push({ name:"contract_mode_metadata_only_no_provider_call", passed:contract?.contractMode === "controlled_provider_request_contract_metadata_only_no_provider_call", reason:"Contract muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"contract_prepared", passed:contract?.providerRequestContractPrepared===true, reason:"Provider Request Contract muss vorbereitet sein." });
  checks.push({ name:"metadata_only", passed:contract?.metadataOnly===true, reason:"Contract muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:contract?.provider==="none" && contract?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_not_included", passed:contract?.promptIncluded===false && contract?.promptRedactedPreviewIncluded===false, reason:"Prompt und redacted preview dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:contract?.secretValuesIncluded===false && contract?.noSecretsIncluded===true && !containsSecretValue(contract), reason:"Secret-Werte dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:contract?.requestBodyIncluded===false, reason:"Request Body darf nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:contract?.networkCallPerformed===false && contract?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:contract?.realLlmCallAllowed===false && contract?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:contract?.executionAllowed===false && contract?.toolExecutionAllowed===false && contract?.agentExecutionAllowed===false && contract?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });
  let decision:ProviderRequestContractPolicyDecision="provider_request_contract_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Request Contract Policy erlaubt nur metadata-only Simulation. Kein Provider-/Netzwerk-Aufruf.";
  if(!contract){ decision="blocked_missing_provider_request_contract"; reason="Provider Request Contract fehlt."; }
  else if(contract.providerRequestContractPrepared!==true){ decision="blocked_contract_not_prepared"; reason="Provider Request Contract ist nicht vorbereitet."; }
  else if(contract.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Contract ist nicht metadata-only."; }
  else if(contract.promptIncluded!==false || contract.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt oder redacted Preview ist enthalten."; }
  else if(contract.secretValuesIncluded!==false || contract.noSecretsIncluded!==true || containsSecretValue(contract)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(contract.requestBodyIncluded!==false){ decision="blocked_request_body_included"; reason="Request Body ist enthalten."; }
  else if(contract.provider!=="none" || contract.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(contract.networkCallPerformed!==false || contract.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(contract.executionAllowed!==false || contract.toolExecutionAllowed!==false || contract.agentExecutionAllowed!==false || contract.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderRequestContractPolicySimulation={
    id:makeId("provider-request-contract-policy-sim"), timestamp:new Date().toISOString(), providerRequestContractId:contract?.id||input.providerRequestContractId, tokenBackedPreflightId:contract?.tokenBackedPreflightId, activationGateId:contract?.activationGateId, issuanceGateId:contract?.issuanceGateId,
    decision, policyMode:"provider_request_contract_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerRequestContractPrepared:true, metadataOnly:true, provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"31.1", providerRequestContractPolicyOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noPromptIncluded:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerRequestContractId, status:sim.decision, riskLevel:"critical", summary:"Provider Request Contract Policy Simulation: "+sim.decision, metadata:{ source:"phase31.1-provider-request-contract-policy", simulationId:sim.id, providerRequestContractId:sim.providerRequestContractId, metadataOnly:true, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderRequestContractPolicySimulations(sims:ProviderRequestContractPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

