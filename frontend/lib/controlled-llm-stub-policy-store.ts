import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type StubPolicyDecision =
  | "simulation_allowed_stub_only"
  | "blocked_missing_stub_response"
  | "blocked_execution_not_safe"
  | "blocked_llm_call_detected"
  | "blocked_secret_risk"
  | "blocked_output_not_explanation_only";

export interface ControlledLlmStubPolicySimulation {
  id: string;
  timestamp: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: StubPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmCallPerformed: false;
  stubOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function responsesPath(): string { return path.join(dataDir(), "controlled-llm-stub-responses.jsonl"); }
function simulationsPath(): string { return path.join(dataDir(), "controlled-llm-stub-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ControlledLlmStubPolicySimulation): void { ensureStore(); appendFileSync(simulationsPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function explanationOnly(response:any): boolean {
  const text=String(response?.responseText||"").toLowerCase();
  const forbidden=["execute tool", "run command", "npm run", "docker compose", "delete", "curl ", "powershell -", "api_key", "authorization:"];
  return !forbidden.some((pattern)=>text.includes(pattern));
}
export function listControlledLlmStubPolicySimulations(limit=100): ControlledLlmStubPolicySimulation[] { ensureStore(); return readJsonl(simulationsPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateControlledLlmStubPolicy(input:{ responseId?: string; metadata?: Record<string, unknown> }): ControlledLlmStubPolicySimulation {
  ensureStore();
  const responses=readJsonl(responsesPath());
  const response=input.responseId ? responses.find((entry:any)=>entry.id===input.responseId) : responses[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"stub_response_exists", passed:Boolean(response), reason: response ? "Stub Response gefunden." : "Stub Response fehlt." });
  checks.push({ name:"llm_call_not_performed", passed: response?.llmCallPerformed === false, reason: response?.llmCallPerformed === false ? "Kein LLM-Aufruf erfolgt." : "LLM-Aufruf wäre erfolgt." });
  checks.push({ name:"stub_only", passed: response?.stubOnly === true, reason: response?.stubOnly === true ? "Stub-only ist aktiv." : "Stub-only fehlt." });
  checks.push({ name:"execution_blocked", passed: response?.executionAllowed === false, reason: response?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wäre nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: response?.toolExecutionAllowed === false, reason: response?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: response?.agentExecutionAllowed === false, reason: response?.agentExecutionAllowed === false ? "Agent-Ausführung bleibt blockiert." : "Agent-Ausführung wäre nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: response?.dryRunOnly === true, reason: response?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"no_secrets", passed: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText), reason: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText) ? "Keine Secret-Muster in Response." : "Secret-Risiko in Response." });
  checks.push({ name:"explanation_only", passed: response ? explanationOnly(response) : false, reason: response && explanationOnly(response) ? "Response bleibt Explanation-only." : "Response enthält potenziell ausführende Inhalte." });
  let decision: StubPolicyDecision="simulation_allowed_stub_only";
  let reason="Stub Response Policy Simulation erlaubt nur Stub-/Dry-run-Erklärung. Keine echte Ausführung.";
  if(!response){ decision="blocked_missing_stub_response"; reason="Stub Response nicht gefunden."; }
  else if(response.executionAllowed!==false || response.toolExecutionAllowed!==false || response.agentExecutionAllowed!==false || response.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Stub Response verletzt Execution Safety Invariants."; }
  else if(response.llmCallPerformed!==false || response.stubOnly!==true){ decision="blocked_llm_call_detected"; reason="Stub Response ist nicht eindeutig stub-only / no-LLM-call."; }
  else if(response.noSecretsIncluded!==true || containsSecretPattern(response.responseText)){ decision="blocked_secret_risk"; reason="Secret-Risiko in Stub Response erkannt."; }
  else if(!explanationOnly(response)){ decision="blocked_output_not_explanation_only"; reason="Stub Response enthält potenziell ausführende Inhalte."; }
  const sim:ControlledLlmStubPolicySimulation={
    id:makeId("llm-stub-policy-sim"),
    timestamp:new Date().toISOString(),
    responseId:response?.id || input.responseId,
    envelopeId:response?.envelopeId,
    recommendationId:response?.recommendationId,
    actionType:response?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmCallPerformed:false,
    stubOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"18.1", noExecution:true, noLlmCall:true, stubOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.responseId,
    status:sim.decision,
    riskLevel:"medium",
    summary:"Controlled LLM Stub Response Policy Simulation: "+sim.decision,
    metadata:{ source:"phase18.1-llm-stub-response-policy", simulationId:sim.id, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, llmCallPerformed:false, stubOnly:true },
  });
  return sim;
}
export function summarizeControlledLlmStubPolicySimulations(sims:ControlledLlmStubPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
