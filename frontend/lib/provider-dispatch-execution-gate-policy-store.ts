import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchExecutionGatePolicyDecision =
  | "provider_dispatch_execution_gate_policy_allowed_execution_blocked_no_provider_call"
  | "blocked_missing_execution_gate"
  | "blocked_execution_gate_not_prepared"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchExecutionGatePolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchExecutionGatePolicyDecision;
  policyMode:"provider_dispatch_execution_gate_policy_execution_blocked_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-execution-gate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchExecutionGatePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?keys*[:=]s*[^s,;]+|tokens*[:=]s*[^s,;]+|secrets*[:=]s*[^s,;]+|passwords*[:=]s*[^s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchExecutionGatePolicySimulations(limit=100): ProviderDispatchExecutionGatePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function simulateProviderDispatchExecutionGatePolicy(input:{ providerDispatchExecutionGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchExecutionGatePolicySimulation {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.providerDispatchExecutionGateId ? gates.find((entry:any)=>entry.id===input.providerDispatchExecutionGateId) : gates[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"execution_gate_exists", passed:Boolean(gate), reason:gate?"Provider Dispatch Execution Gate gefunden.":"Provider Dispatch Execution Gate fehlt." });
  checks.push({ name:"execution_gate_prepared", passed:gate?.providerDispatchExecutionGatePrepared===true, reason:"Execution Gate muss nur vorbereitet sein." });
  checks.push({ name:"execution_gate_closed", passed:gate?.executionGateOpen===false, reason:"Execution Gate muss geschlossen bleiben." });
  checks.push({ name:"final_dispatch_not_allowed", passed:gate?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:gate?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgefÃ¼hrt sein." });
  checks.push({ name:"token_not_bound_or_active", passed:gate?.tokenBoundToDispatch===false && gate?.tokenBindingActive===false && gate?.tokenActive===false, reason:"Token darf nicht gebunden oder aktiv sein." });
  checks.push({ name:"metadata_only", passed:gate?.metadataOnly===true, reason:"Execution Gate bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:gate?.provider==="none" && gate?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:gate?.dispatchPayloadIncluded===false && gate?.promptPayloadIncluded===false && gate?.promptIncluded===false && gate?.requestBodyIncluded===false && gate?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Prompt- und Request-Payloads dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:gate?.secretValuesIncluded===false && gate?.noSecretsIncluded===true && !containsSecretValue(gate), reason:"Secret-Werte dÃ¼rfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallAllowed===false && gate?.networkCallPerformed===false && gate?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-AusfÃ¼hrung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:gate?.realLlmCallAllowed===false && gate?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed===false && gate?.toolExecutionAllowed===false && gate?.agentExecutionAllowed===false && gate?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung bleiben blockiert." });

  let decision:ProviderDispatchExecutionGatePolicyDecision="provider_dispatch_execution_gate_policy_allowed_execution_blocked_no_provider_call";
  let reason="Provider Dispatch Execution Gate Policy erlaubt nur execution-blocked no-provider-call Simulation. Execution Gate bleibt geschlossen.";
  if(!gate){ decision="blocked_missing_execution_gate"; reason="Provider Dispatch Execution Gate fehlt."; }
  else if(gate.providerDispatchExecutionGatePrepared!==true){ decision="blocked_execution_gate_not_prepared"; reason="Execution Gate ist nicht vorbereitet."; }
  else if(gate.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(gate.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(gate.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgefÃ¼hrt."; }
  else if(gate.tokenBoundToDispatch!==false || gate.tokenBindingActive!==false || gate.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden oder aktiv."; }
  else if(gate.provider!=="none" || gate.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(gate.networkCallAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(gate.dispatchPayloadIncluded!==false || gate.promptPayloadIncluded!==false || gate.promptIncluded!==false || gate.requestBodyIncluded!==false || gate.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(gate.secretValuesIncluded!==false || gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const sim:ProviderDispatchExecutionGatePolicySimulation={
    id:makeId("provider-dispatch-execution-gate-policy-sim"),
    timestamp:new Date().toISOString(),
    providerDispatchExecutionGateId:gate?.id||input.providerDispatchExecutionGateId,
    providerDispatchFinalPreflightId:gate?.providerDispatchFinalPreflightId,
    providerDispatchTokenBindingId:gate?.providerDispatchTokenBindingId,
    providerDispatchReadinessId:gate?.providerDispatchReadinessId,
    decision,
    policyMode:"provider_dispatch_execution_gate_policy_execution_blocked_no_provider_call",
    policyChecks:checks,
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
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"36.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchExecutionGateId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Execution Gate Policy Simulation: "+sim.decision, metadata:{ source:"phase36.1-provider-dispatch-execution-gate-policy", simulationId:sim.id, providerDispatchExecutionGateId:sim.providerDispatchExecutionGateId, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchExecutionGatePolicySimulations(sims:ProviderDispatchExecutionGatePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }

