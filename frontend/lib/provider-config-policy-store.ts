import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderConfigPolicyDecision =
  | "simulation_allowed_secret_boundary_only"
  | "blocked_missing_boundary_check"
  | "blocked_secret_value_detected"
  | "blocked_network_or_provider_call"
  | "blocked_execution_not_safe"
  | "blocked_secret_boundary_violation";

export interface ProviderConfigPolicySimulation {
  id: string;
  timestamp: string;
  boundaryCheckId?: string;
  decision: ProviderConfigPolicyDecision;
  providerConfigMode: "secret_boundary_presence_metadata_only";
  providers: Array<{
    providerKey: string;
    enabled: boolean;
    requiredEnvKeys: string[];
    presentEnvKeys: string[];
    missingEnvKeys: string[];
    secretValuesStored: false;
    secretValuesExposed: false;
  }>;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function boundaryPath(): string { return path.join(dataDir(), "provider-config-secret-boundary-checks.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-config-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ProviderConfigPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderConfigPolicySimulations(limit=100): ProviderConfigPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderConfigPolicy(input:{ boundaryCheckId?: string; metadata?: Record<string, unknown> }): ProviderConfigPolicySimulation {
  ensureStore();
  const checksSource=readJsonl(boundaryPath());
  const boundary=input.boundaryCheckId ? checksSource.find((entry:any)=>entry.id===input.boundaryCheckId) : checksSource[0];
  const providers=Array.isArray(boundary?.providers) ? boundary.providers : [];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"boundary_check_exists", passed:Boolean(boundary), reason: boundary ? "Provider Config Boundary Check gefunden." : "Provider Config Boundary Check fehlt." });
  checks.push({ name:"presence_metadata_only", passed: boundary?.providerConfigMode === "secret_boundary_presence_metadata_only", reason:"Boundary Check muss nur Presence-/Metadata speichern." });
  checks.push({ name:"no_secret_values_stored", passed: providers.every((p:any)=>p.secretValuesStored === false) && boundary?.metadata?.noSecretValuesStored === true, reason:"Secret-Werte dÃ¼rfen nicht gespeichert werden." });
  checks.push({ name:"no_secret_values_exposed", passed: providers.every((p:any)=>p.secretValuesExposed === false) && boundary?.metadata?.noSecretValuesExposed === true, reason:"Secret-Werte dÃ¼rfen nicht angezeigt oder geloggt werden." });
  checks.push({ name:"no_secret_patterns", passed: boundary?.noSecretsIncluded === true && !containsSecretValue(boundary), reason:"Boundary Payload darf keine Secret-Ã¤hnlichen Werte enthalten." });
  checks.push({ name:"local_stub_available", passed: providers.some((p:any)=>p.providerKey === "local_stub" && p.enabled === true), reason:"Local Stub muss als No-Network-Fallback verfÃ¼gbar bleiben." });
  checks.push({ name:"network_blocked", passed: boundary?.networkCallPerformed === false, reason:"Netzwerk-/Provider-Aufruf muss blockiert bleiben." });
  checks.push({ name:"provider_execution_blocked", passed: boundary?.providerExecutionAllowed === false, reason:"Provider Execution muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed: boundary?.realLlmCallAllowed === false && boundary?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: boundary?.executionAllowed === false && boundary?.toolExecutionAllowed === false && boundary?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-AusfÃ¼hrung mÃ¼ssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: boundary?.dryRunOnly === true, reason: boundary?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision: ProviderConfigPolicyDecision="simulation_allowed_secret_boundary_only";
  let reason="Provider Config Policy Simulation erlaubt nur Secret Boundary Presence-/Metadata-Checks. Kein Provider Call.";
  if(!boundary){ decision="blocked_missing_boundary_check"; reason="Provider Config Boundary Check nicht gefunden."; }
  else if(containsSecretValue(boundary) || boundary.noSecretsIncluded !== true){ decision="blocked_secret_value_detected"; reason="Secret-Ã¤hnlicher Wert im Boundary Check erkannt."; }
  else if(boundary.networkCallPerformed !== false || boundary.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Netzwerk- oder Provider-AusfÃ¼hrung nicht eindeutig blockiert."; }
  else if(boundary.executionAllowed !== false || boundary.toolExecutionAllowed !== false || boundary.agentExecutionAllowed !== false || boundary.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Boundary Check verletzt Execution Safety Invariants."; }
  else if(providers.some((p:any)=>p.secretValuesStored !== false || p.secretValuesExposed !== false) || boundary.providerConfigMode !== "secret_boundary_presence_metadata_only"){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary wurde verletzt."; }
  const sim: ProviderConfigPolicySimulation={
    id:makeId("provider-config-policy-sim"),
    timestamp:new Date().toISOString(),
    boundaryCheckId:boundary?.id || input.boundaryCheckId,
    decision,
    providerConfigMode:"secret_boundary_presence_metadata_only",
    providers,
    policyChecks:checks,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_value_detected" && decision !== "blocked_secret_boundary_violation",
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"23.1", noSecretValuesStored:true, noSecretValuesExposed:true, noNetworkCall:true, noProviderCall:true, policySimulationOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.boundaryCheckId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Provider Config Policy Simulation: "+sim.decision,
    metadata:{ source:"phase23.1-provider-config-policy", simulationId:sim.id, boundaryCheckId:sim.boundaryCheckId, noSecretValuesStored:true, noSecretValuesExposed:true, networkCallPerformed:false, providerExecutionAllowed:false },
  });
  return sim;
}
export function summarizeProviderConfigPolicySimulations(sims:ProviderConfigPolicySimulation[]){ const byDecision:Record<string,number>={}; const providerPresence:Record<string,{enabled:number,total:number}>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; for(const provider of sim.providers||[]){ const key=provider.providerKey; providerPresence[key]=providerPresence[key]||{enabled:0,total:0}; providerPresence[key].total+=1; if(provider.enabled) providerPresence[key].enabled+=1; } } return { total:sims.length, byDecision, providerPresence }; }

