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
  pkg.scripts["phase24:1:patch"]="node scripts/phase24-1-patch-readiness-policy-audit.cjs";
  pkg.scripts["phase24:1:verify"]="node scripts/phase24-1-verify-readiness-policy-audit.cjs";
  pkg.scripts["llm:provider-readiness:policy:verify"]="node scripts/phase24-1-verify-readiness-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 24.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderReadinessPolicyDecision =
  | "simulation_allowed_readiness_only"
  | "blocked_missing_readiness_preflight"
  | "blocked_secret_boundary_violation"
  | "blocked_network_or_provider_call"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_operational_defaults_violation";

export interface ProviderReadinessPolicySimulation {
  id: string;
  timestamp: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ProviderReadinessPolicyDecision;
  readinessMode: "provider_invocation_readiness_preflight_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  operationalDefaults: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
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
function preflightPath(): string { return path.join(dataDir(), "provider-invocation-readiness-preflights.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-readiness-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ProviderReadinessPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderReadinessPolicySimulations(limit=100): ProviderReadinessPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderReadinessPolicy(input:{ preflightId?: string; metadata?: Record<string, unknown> }): ProviderReadinessPolicySimulation {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const defaults=preflight?.operationalDefaults || {};
  const output=preflight?.outputContract || {};
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"readiness_preflight_exists", passed:Boolean(preflight), reason: preflight ? "Readiness Preflight gefunden." : "Readiness Preflight fehlt." });
  checks.push({ name:"readiness_mode_no_provider_call", passed:preflight?.readinessMode === "provider_invocation_readiness_preflight_no_provider_call", reason:"Readiness Mode muss no-provider-call bleiben." });
  checks.push({ name:"no_secret_values", passed:preflight?.noSecretsIncluded === true && !containsSecretValue(preflight), reason:"Preflight darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"network_provider_blocked", passed:preflight?.networkCallPerformed === false && preflight?.providerExecutionAllowed === false, reason:"Netzwerk- und Provider-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed:preflight?.realLlmCallAllowed === false && preflight?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed === false && preflight?.toolExecutionAllowed === false && preflight?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:preflight?.dryRunOnly === true, reason:preflight?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend sein." });
  checks.push({ name:"operational_defaults_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Cost, RateLimit, Timeout und Observability dürfen nur Metadata Defaults sein." });
  let decision: ProviderReadinessPolicyDecision="simulation_allowed_readiness_only";
  let reason="Provider Readiness Policy Simulation erlaubt nur Readiness/Metadata. Kein Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_readiness_preflight"; reason="Readiness Preflight nicht gefunden."; }
  else if(preflight.noSecretsIncluded !== true || containsSecretValue(preflight)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt oder Secret-ähnlicher Wert erkannt."; }
  else if(preflight.networkCallPerformed !== false || preflight.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Netzwerk-/Provider-Ausführung ist nicht eindeutig blockiert."; }
  else if(preflight.realLlmCallAllowed !== false || preflight.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(preflight.executionAllowed !== false || preflight.toolExecutionAllowed !== false || preflight.agentExecutionAllowed !== false || preflight.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="operational_defaults_metadata_only")?.passed !== true){ decision="blocked_operational_defaults_violation"; reason="Operational Defaults verletzen Metadata-only Vorgaben."; }
  const sim: ProviderReadinessPolicySimulation={
    id:makeId("provider-readiness-policy-sim"),
    timestamp:new Date().toISOString(),
    preflightId:preflight?.id || input.preflightId,
    boundaryCheckId:preflight?.boundaryCheckId,
    adapterStubId:preflight?.adapterStubId,
    invocationEnvelopeId:preflight?.invocationEnvelopeId,
    decision,
    readinessMode:"provider_invocation_readiness_preflight_no_provider_call",
    policyChecks:checks,
    operationalDefaults:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_boundary_violation",
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"24.1", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, readinessPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.preflightId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Provider Readiness Policy Simulation: "+sim.decision,
    metadata:{ source:"phase24.1-provider-readiness-policy", simulationId:sim.id, preflightId:sim.preflightId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeProviderReadinessPolicySimulations(sims:ProviderReadinessPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api = String.raw`import { listProviderReadinessPolicySimulations, simulateProviderReadinessPolicy, summarizeProviderReadinessPolicySimulations } from "../../../lib/provider-readiness-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listProviderReadinessPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderReadinessPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Readiness Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateProviderReadinessPolicy({ preflightId: typeof body.preflightId==="string" ? body.preflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Readiness Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Preflight={id:string;decision:string;timestamp:string;readinessMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;readinessMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;operationalDefaults:any;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderReadinessPolicyPage(){
 const [preflights,setPreflights]=useState<Preflight[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,sRes]=await Promise.all([fetch("/api/provider-invocation-readiness-preflight?limit=100",{cache:"no-store"}),fetch("/api/provider-readiness-policy?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const s=await sRes.json(); if(pRes.ok){ const list=Array.isArray(p.preflights)?p.preflights:[]; setPreflights(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Provider Readiness Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-readiness-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({preflightId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-readiness-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Provider Readiness Policy</h1><p style={{lineHeight:1.6}}>Phase 24.1 simuliert Policy Checks für Provider Invocation Readiness Preflights. Kein Provider-/Netzwerk-Aufruf und kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{preflights.map((p)=><option key={p.id} value={p.id}>{p.readinessMode} · {p.decision} · {p.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Readiness Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.readinessMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(sim.operationalDefaults ?? {}, null, 2)}</pre><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-readiness-policy"')){ const marker='{ href: "/provider-invocation-readiness-preflight", label: "Provider Readiness", key: "provider-invocation-readiness-preflight" },'; const line='  { href: "/provider-readiness-policy", label: "Readiness Policy", key: "provider-readiness-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Readiness Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Readiness Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase24-1-readiness-policy-simulation-audit.md", `# Phase 24.1 – Readiness Policy Simulation & Audit

## Ziel
Provider Invocation Readiness Preflights werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /provider-readiness-policy
- API: /api/provider-readiness-policy
- Store: data/provider-readiness-policy-simulations.jsonl

## Sicherheitsprinzip
- readiness only / metadata only
- keinen Provider-/Netzwerk-Aufruf
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- Operational Defaults nur Metadata
- Output Contract locked
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 24.2 kann Provider Readiness Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase24-readiness-policy-simulation-audit-runbook.md", `# Runbook – Phase 24.1 Provider Readiness Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase24:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase24-1-patch-readiness-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase24:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-readiness-policy-store.ts", store);
ensureFile("frontend/app/api/provider-readiness-policy/route.ts", api);
ensureFile("frontend/app/provider-readiness-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 24.1 Patch abgeschlossen.");
