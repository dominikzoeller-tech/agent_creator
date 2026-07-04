import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderConfigDecision =
  | "provider_config_boundary_prepared"
  | "blocked_secret_value_detected"
  | "blocked_network_or_provider_call"
  | "blocked_execution_not_safe";

export interface ProviderConfigSecretBoundaryCheck {
  id: string;
  timestamp: string;
  decision: ProviderConfigDecision;
  providerConfigMode: "secret_boundary_presence_metadata_only";
  providers: Array<{
    providerKey: "azure_openai" | "openai" | "anthropic" | "local_stub";
    enabled: boolean;
    requiredEnvKeys: string[];
    presentEnvKeys: string[];
    missingEnvKeys: string[];
    secretValuesStored: false;
    secretValuesExposed: false;
  }>;
  boundaryChecks: Array<{ name: string; passed: boolean; reason: string }>;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function storePath(): string { return path.join(dataDir(), "provider-config-secret-boundary-checks.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendCheck(check: ProviderConfigSecretBoundaryCheck): void { ensureStore(); appendFileSync(storePath(), JSON.stringify(check)+"\n", "utf8"); }
const providerDefinitions = [
  { providerKey:"azure_openai" as const, requiredEnvKeys:["AZURE_OPENAI_ENDPOINT","AZURE_OPENAI_DEPLOYMENT","AZURE_OPENAI_API_KEY"] },
  { providerKey:"openai" as const, requiredEnvKeys:["OPENAI_API_KEY","OPENAI_MODEL"] },
  { providerKey:"anthropic" as const, requiredEnvKeys:["ANTHROPIC_API_KEY","ANTHROPIC_MODEL"] },
  { providerKey:"local_stub" as const, requiredEnvKeys:[] },
];
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderConfigSecretBoundaryChecks(limit=100): ProviderConfigSecretBoundaryCheck[] { ensureStore(); return readJsonl(storePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderConfigSecretBoundaryCheck(input:{ metadata?: Record<string, unknown> }): ProviderConfigSecretBoundaryCheck {
  ensureStore();
  const providers=providerDefinitions.map((def)=>{
    const presentEnvKeys=def.requiredEnvKeys.filter((key)=>typeof process.env[key] === "string" && String(process.env[key]).length > 0);
    const missingEnvKeys=def.requiredEnvKeys.filter((key)=>!presentEnvKeys.includes(key));
    return { providerKey:def.providerKey, enabled:def.providerKey === "local_stub" || missingEnvKeys.length === 0, requiredEnvKeys:def.requiredEnvKeys, presentEnvKeys, missingEnvKeys, secretValuesStored:false as const, secretValuesExposed:false as const };
  });
  const localStub=providers.find((p)=>p.providerKey==="local_stub");
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"presence_metadata_only", passed:true, reason:"Nur ENV-Key-Namen und Presence-Status werden gespeichert, keine Werte." });
  checks.push({ name:"no_secret_values_in_payload", passed:!containsSecretValue({ providers, metadata: input.metadata }), reason:"Payload darf keine Secret-Werte enthalten." });
  checks.push({ name:"local_stub_available", passed:localStub?.enabled === true, reason:"Local Stub bleibt als sichere No-Network-Fallback-Konfiguration verfügbar." });
  checks.push({ name:"no_network_call", passed:true, reason:"Phase 23.0 führt keinen Netzwerk- oder Provider-Aufruf aus." });
  checks.push({ name:"provider_execution_blocked", passed:true, reason:"Provider Execution bleibt blockiert." });
  checks.push({ name:"tool_agent_execution_blocked", passed:true, reason:"Tool- und Agent-Ausführung bleiben blockiert." });
  let decision: ProviderConfigDecision="provider_config_boundary_prepared";
  let reason="Provider Configuration & Secret Boundary vorbereitet. Nur Presence-/Metadata-Checks, keine Secrets, kein Provider Call.";
  if(containsSecretValue({ providers, metadata: input.metadata })){ decision="blocked_secret_value_detected"; reason="Secret-ähnlicher Wert in Payload erkannt."; }
  const check: ProviderConfigSecretBoundaryCheck={
    id:makeId("provider-config-boundary"),
    timestamp:new Date().toISOString(),
    decision,
    providerConfigMode:"secret_boundary_presence_metadata_only",
    providers,
    boundaryChecks:checks,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_value_detected",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"23.0", noSecretValuesStored:true, noSecretValuesExposed:true, noNetworkCall:true, noProviderCall:true },
  };
  appendCheck(check);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:check.id,
    status:check.decision,
    riskLevel:"high",
    summary:"Provider Config Secret Boundary: "+check.decision,
    metadata:{ source:"phase23.0-provider-config-secret-boundary", boundaryCheckId:check.id, noSecretValuesStored:true, noSecretValuesExposed:true, networkCallPerformed:false, providerExecutionAllowed:false },
  });
  return check;
}
export function summarizeProviderConfigSecretBoundaryChecks(checks:ProviderConfigSecretBoundaryCheck[]){ const byDecision:Record<string,number>={}; const providerPresence:Record<string,{enabled:number,total:number}>={}; for(const check of checks){ byDecision[check.decision]=(byDecision[check.decision]||0)+1; for(const provider of check.providers||[]){ const key=provider.providerKey; providerPresence[key]=providerPresence[key]||{enabled:0,total:0}; providerPresence[key].total+=1; if(provider.enabled) providerPresence[key].enabled+=1; } } return { total:checks.length, byDecision, providerPresence }; }
