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
  pkg.scripts["phase23:1:patch"]="node scripts/phase23-1-patch-provider-config-policy-audit.cjs";
  pkg.scripts["phase23:1:verify"]="node scripts/phase23-1-verify-provider-config-policy-audit.cjs";
  pkg.scripts["llm:provider-config:policy:verify"]="node scripts/phase23-1-verify-provider-config-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 23.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
  checks.push({ name:"no_secret_values_stored", passed: providers.every((p:any)=>p.secretValuesStored === false) && boundary?.metadata?.noSecretValuesStored === true, reason:"Secret-Werte dürfen nicht gespeichert werden." });
  checks.push({ name:"no_secret_values_exposed", passed: providers.every((p:any)=>p.secretValuesExposed === false) && boundary?.metadata?.noSecretValuesExposed === true, reason:"Secret-Werte dürfen nicht angezeigt oder geloggt werden." });
  checks.push({ name:"no_secret_patterns", passed: boundary?.noSecretsIncluded === true && !containsSecretValue(boundary), reason:"Boundary Payload darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"local_stub_available", passed: providers.some((p:any)=>p.providerKey === "local_stub" && p.enabled === true), reason:"Local Stub muss als No-Network-Fallback verfügbar bleiben." });
  checks.push({ name:"network_blocked", passed: boundary?.networkCallPerformed === false, reason:"Netzwerk-/Provider-Aufruf muss blockiert bleiben." });
  checks.push({ name:"provider_execution_blocked", passed: boundary?.providerExecutionAllowed === false, reason:"Provider Execution muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed: boundary?.realLlmCallAllowed === false && boundary?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: boundary?.executionAllowed === false && boundary?.toolExecutionAllowed === false && boundary?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: boundary?.dryRunOnly === true, reason: boundary?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision: ProviderConfigPolicyDecision="simulation_allowed_secret_boundary_only";
  let reason="Provider Config Policy Simulation erlaubt nur Secret Boundary Presence-/Metadata-Checks. Kein Provider Call.";
  if(!boundary){ decision="blocked_missing_boundary_check"; reason="Provider Config Boundary Check nicht gefunden."; }
  else if(containsSecretValue(boundary) || boundary.noSecretsIncluded !== true){ decision="blocked_secret_value_detected"; reason="Secret-ähnlicher Wert im Boundary Check erkannt."; }
  else if(boundary.networkCallPerformed !== false || boundary.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Netzwerk- oder Provider-Ausführung nicht eindeutig blockiert."; }
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
`;
const api = String.raw`import { listProviderConfigPolicySimulations, simulateProviderConfigPolicy, summarizeProviderConfigPolicySimulations } from "../../../lib/provider-config-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listProviderConfigPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderConfigPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateProviderConfigPolicy({ boundaryCheckId: typeof body.boundaryCheckId==="string" ? body.boundaryCheckId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Boundary={id:string;decision:string;timestamp:string;providerConfigMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;providerConfigMode:string;providers:any[];policyChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderConfigPolicyPage(){
 const [boundaries,setBoundaries]=useState<Boundary[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [bRes,sRes]=await Promise.all([fetch("/api/provider-config-secret-boundary?limit=100",{cache:"no-store"}),fetch("/api/provider-config-policy?limit=100",{cache:"no-store"})]); const b=await bRes.json(); const s=await sRes.json(); if(bRes.ok){ const list=Array.isArray(b.boundaryChecks)?b.boundaryChecks:[]; setBoundaries(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Provider Config Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-config-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({boundaryCheckId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-config-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Provider Config Policy</h1><p style={{lineHeight:1.6}}>Phase 23.1 simuliert Policy Checks für Provider Config Secret Boundary. Keine Secret-Werte, keine Provider-/Netzwerk-Aufrufe.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{boundaries.map((b)=><option key={b.id} value={b.id}>{b.providerConfigMode} · {b.decision} · {b.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Config Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.providerConfigMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><h3>Policy Checks</h3><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-config-policy"')){ const marker='{ href: "/provider-config-secret-boundary", label: "Secret Boundary", key: "provider-config-secret-boundary" },'; const line='  { href: "/provider-config-policy", label: "Provider Config Policy", key: "provider-config-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Config Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Config Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase23-1-provider-config-policy-simulation-audit.md", `# Phase 23.1 – Provider Config Policy Simulation & Audit

## Ziel
Provider Config Secret Boundary Checks werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /provider-config-policy
- API: /api/provider-config-policy
- Store: data/provider-config-policy-simulations.jsonl

## Sicherheitsprinzip
- secret_boundary_presence_metadata_only
- keine Secrets in UI, Logs oder JSONL Stores
- noSecretValuesStored=true
- noSecretValuesExposed=true
- nur Presence-/Metadata-Checks für ENV Variablen
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
Phase 23.2 kann Provider Config Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase23-provider-config-policy-simulation-audit-runbook.md", `# Runbook – Phase 23.1 Provider Config Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase23:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase23-1-patch-provider-config-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase23:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-config-policy-store.ts", store);
ensureFile("frontend/app/api/provider-config-policy/route.ts", api);
ensureFile("frontend/app/provider-config-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 23.1 Patch abgeschlossen.");
