const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase23:0:patch"]="node scripts/phase23-0-patch-provider-config-secret-boundary.cjs";
  pkg.scripts["phase23:0:verify"]="node scripts/phase23-0-verify-provider-config-secret-boundary.cjs";
  pkg.scripts["llm:provider-config:verify"]="node scripts/phase23-0-verify-provider-config-secret-boundary.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 23.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
`;
const api = String.raw`import { createProviderConfigSecretBoundaryCheck, listProviderConfigSecretBoundaryChecks, summarizeProviderConfigSecretBoundaryChecks } from "../../../lib/provider-config-secret-boundary-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const boundaryChecks=listProviderConfigSecretBoundaryChecks(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderConfigSecretBoundaryChecks(boundaryChecks), boundaryChecks });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Boundary Checks konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const boundaryCheck=createProviderConfigSecretBoundaryCheck({ metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, boundaryCheck });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Boundary Check konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type BoundaryCheck={id:string;timestamp:string;decision:string;reason:string;providerConfigMode:string;providers:Array<{providerKey:string;enabled:boolean;requiredEnvKeys:string[];presentEnvKeys:string[];missingEnvKeys:string[];secretValuesStored:boolean;secretValuesExposed:boolean}>;boundaryChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderConfigSecretBoundaryPage(){
 const [checks,setChecks]=useState<BoundaryCheck[]>([]); const [summary,setSummary]=useState<any>(null); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const res=await fetch("/api/provider-config-secret-boundary?limit=100",{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||"Boundary Checks konnten nicht geladen werden."); setChecks(Array.isArray(payload.boundaryChecks)?payload.boundaryChecks:[]); setSummary(payload.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createCheck(){ const res=await fetch("/api/provider-config-secret-boundary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({metadata:{trigger:"ui"}})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Boundary Check fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-config-secret-boundary" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Provider Config Secret Boundary</h1><p style={{lineHeight:1.6}}>Phase 23.0 bereitet Provider-Konfiguration und Secret Boundary vor. Es werden nur Presence-/Metadata-Checks gespeichert. Keine Secret-Werte, keine Provider-/Netzwerk-Aufrufe.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Boundary Check erstellen</h2><button className="primary-button" type="button" onClick={createCheck}>Provider Config Boundary prüfen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Boundary Checks</h2>{checks.length===0 ? <p>Noch keine Boundary Checks.</p> : checks.map((check)=><article key={check.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{check.providerConfigMode}</strong> <span className="chip">{check.decision}</span></div><div className="helper-text"><code>{check.id}</code> · {check.timestamp}</div><p><strong>Reason:</strong> {check.reason}</p><p><strong>No secrets:</strong> {String(check.noSecretsIncluded)} · <strong>Network call:</strong> {String(check.networkCallPerformed)} · <strong>Provider execution:</strong> {String(check.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(check.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(check.llmCallPerformed)} · <strong>Execution:</strong> {String(check.executionAllowed)} · <strong>Tool:</strong> {String(check.toolExecutionAllowed)} · <strong>Agent:</strong> {String(check.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(check.dryRunOnly)}</p><h3>Providers</h3><ul>{check.providers?.map((provider)=><li key={provider.providerKey}><strong>{provider.providerKey}:</strong> enabled={String(provider.enabled)} · present=[{provider.presentEnvKeys.join(", ")}] · missing=[{provider.missingEnvKeys.join(", ")}] · secretValuesStored={String(provider.secretValuesStored)} · secretValuesExposed={String(provider.secretValuesExposed)}</li>)}</ul><h3>Boundary Checks</h3><ul>{check.boundaryChecks?.map((entry)=><li key={entry.name}><strong>{entry.name}:</strong> {String(entry.passed)} – {entry.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-config-secret-boundary"')){ const line='  { href: "/provider-config-secret-boundary", label: "Secret Boundary", key: "provider-config-secret-boundary" },'; const markers=['{ href: "/provider-llm-adapter-dashboard", label: "Provider Dashboard", key: "provider-llm-adapter-dashboard" },','{ href: "/provider-llm-adapter-policy", label: "Provider Policy", key: "provider-llm-adapter-policy" },','{ href: "/provider-llm-adapter-stub", label: "Provider Stub", key: "provider-llm-adapter-stub" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Secret Boundary Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Secret Boundary bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase23-0-provider-configuration-secret-boundary.md", `# Phase 23.0 – Provider Configuration & Secret Boundary / No Secret Exposure

## Ziel
Provider-Konfiguration und Secret Boundary werden vorbereitet, ohne Secret-Werte auszugeben oder zu speichern.

## Neue UI/API
- UI: /provider-config-secret-boundary
- API: /api/provider-config-secret-boundary
- Store: data/provider-config-secret-boundary-checks.jsonl

## Sicherheitsprinzip
- secret_boundary_presence_metadata_only
- keine Secrets in UI, Logs oder JSONL Stores
- nur Presence-/Metadata-Checks für ENV Variablen
- provider=none bleibt gültiger Stub-Pfad
- kein externer Netzwerk-/Provider-Aufruf
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 23.1 kann Provider Config Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase23-provider-configuration-secret-boundary-runbook.md", `# Runbook – Phase 23.0 Provider Configuration & Secret Boundary

## Patch
\`\`\`powershell
npm run phase23:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase23-0-patch-provider-config-secret-boundary.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase23:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-config-secret-boundary-store.ts", store);
ensureFile("frontend/app/api/provider-config-secret-boundary/route.ts", api);
ensureFile("frontend/app/provider-config-secret-boundary/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 23.0 Patch abgeschlossen.");
