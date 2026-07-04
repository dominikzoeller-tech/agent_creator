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
  pkg.scripts["phase24:0:patch"]="node scripts/phase24-0-patch-provider-invocation-readiness-preflight.cjs";
  pkg.scripts["phase24:0:verify"]="node scripts/phase24-0-verify-provider-invocation-readiness-preflight.cjs";
  pkg.scripts["llm:provider-readiness:verify"]="node scripts/phase24-0-verify-provider-invocation-readiness-preflight.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 24.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderInvocationReadinessDecision =
  | "readiness_preflight_prepared_no_provider_call"
  | "blocked_missing_provider_config_boundary"
  | "blocked_missing_provider_adapter_stub"
  | "blocked_secret_boundary_violation"
  | "blocked_network_or_provider_call"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation";

export interface ProviderInvocationReadinessPreflight {
  id: string;
  timestamp: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ProviderInvocationReadinessDecision;
  readinessMode: "provider_invocation_readiness_preflight_no_provider_call";
  readinessChecks: Array<{ name: string; passed: boolean; reason: string }>;
  operationalDefaults: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
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
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function boundaryPath(): string { return path.join(dataDir(), "provider-config-secret-boundary-checks.jsonl"); }
function adapterPath(): string { return path.join(dataDir(), "provider-agnostic-llm-invocation-adapter-stubs.jsonl"); }
function preflightPath(): string { return path.join(dataDir(), "provider-invocation-readiness-preflights.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPreflight(preflight: ProviderInvocationReadinessPreflight): void { ensureStore(); appendFileSync(preflightPath(), JSON.stringify(preflight)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderInvocationReadinessPreflights(limit=100): ProviderInvocationReadinessPreflight[] { ensureStore(); return readJsonl(preflightPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderInvocationReadinessPreflight(input:{ boundaryCheckId?: string; adapterStubId?: string; metadata?: Record<string, unknown> }): ProviderInvocationReadinessPreflight {
  ensureStore();
  const boundaryChecks=readJsonl(boundaryPath());
  const adapterStubs=readJsonl(adapterPath());
  const boundary=input.boundaryCheckId ? boundaryChecks.find((entry:any)=>entry.id===input.boundaryCheckId) : boundaryChecks[0];
  const adapter=input.adapterStubId ? adapterStubs.find((entry:any)=>entry.id===input.adapterStubId) : adapterStubs[0];
  const providers=Array.isArray(boundary?.providers) ? boundary.providers : [];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"provider_config_boundary_exists", passed:Boolean(boundary), reason: boundary ? "Provider Config Secret Boundary gefunden." : "Provider Config Secret Boundary fehlt." });
  checks.push({ name:"provider_adapter_stub_exists", passed:Boolean(adapter), reason: adapter ? "Provider Adapter Stub gefunden." : "Provider Adapter Stub fehlt." });
  checks.push({ name:"secret_boundary_presence_metadata_only", passed: boundary?.providerConfigMode === "secret_boundary_presence_metadata_only", reason:"Provider Config darf nur Presence-/Metadata speichern." });
  checks.push({ name:"no_secret_values_stored_or_exposed", passed: providers.every((p:any)=>p.secretValuesStored === false && p.secretValuesExposed === false) && boundary?.metadata?.noSecretValuesStored === true && boundary?.metadata?.noSecretValuesExposed === true, reason:"Secret-Werte dürfen nicht gespeichert oder angezeigt werden." });
  checks.push({ name:"no_secret_patterns", passed: boundary?.noSecretsIncluded === true && adapter?.noSecretsIncluded === true && !containsSecretValue({ boundary, adapter }), reason:"Boundary und Adapter dürfen keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"no_network_or_provider_call", passed: boundary?.networkCallPerformed === false && adapter?.networkCallPerformed === false && adapter?.providerRequestPreview?.networkCallAllowed === false, reason:"Netzwerk-/Provider-Aufruf muss blockiert bleiben." });
  checks.push({ name:"provider_execution_blocked", passed: boundary?.providerExecutionAllowed === false && adapter?.providerExecutionAllowed === false, reason:"Provider Execution muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed: boundary?.realLlmCallAllowed === false && boundary?.llmCallPerformed === false && adapter?.realLlmCallAllowed === false && adapter?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: boundary?.executionAllowed === false && boundary?.toolExecutionAllowed === false && boundary?.agentExecutionAllowed === false && adapter?.executionAllowed === false && adapter?.toolExecutionAllowed === false && adapter?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: boundary?.dryRunOnly === true && adapter?.dryRunOnly === true, reason:"Dry-run-only muss aktiv bleiben." });
  checks.push({ name:"output_contract", passed: adapter?.providerRequestPreview?.outputContractType === "recommendation_explanation_only", reason:"Output Contract muss recommendation_explanation_only bleiben." });
  checks.push({ name:"operational_defaults_metadata_only", passed:true, reason:"Timeout, Cost und RateLimit werden nur als Metadata Defaults vorbereitet." });
  let decision: ProviderInvocationReadinessDecision="readiness_preflight_prepared_no_provider_call";
  let reason="Provider Invocation Readiness Preflight vorbereitet. Kein Provider-/Netzwerk-Aufruf und kein produktiver LLM-Aufruf.";
  if(!boundary){ decision="blocked_missing_provider_config_boundary"; reason="Provider Config Secret Boundary fehlt."; }
  else if(!adapter){ decision="blocked_missing_provider_adapter_stub"; reason="Provider Adapter Stub fehlt."; }
  else if(boundary.noSecretsIncluded !== true || adapter.noSecretsIncluded !== true || containsSecretValue({ boundary, adapter })){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt oder Secret-ähnlicher Wert erkannt."; }
  else if(boundary.networkCallPerformed !== false || adapter.networkCallPerformed !== false || adapter.providerRequestPreview?.networkCallAllowed !== false || boundary.providerExecutionAllowed !== false || adapter.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Netzwerk-/Provider-Ausführung ist nicht eindeutig blockiert."; }
  else if(boundary.realLlmCallAllowed !== false || boundary.llmCallPerformed !== false || adapter.realLlmCallAllowed !== false || adapter.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(boundary.executionAllowed !== false || boundary.toolExecutionAllowed !== false || boundary.agentExecutionAllowed !== false || adapter.executionAllowed !== false || adapter.toolExecutionAllowed !== false || adapter.agentExecutionAllowed !== false || boundary.dryRunOnly !== true || adapter.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(adapter.providerRequestPreview?.outputContractType !== "recommendation_explanation_only"){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt recommendation_explanation_only."; }
  const preflight: ProviderInvocationReadinessPreflight={
    id:makeId("provider-readiness-preflight"),
    timestamp:new Date().toISOString(),
    boundaryCheckId:boundary?.id || input.boundaryCheckId,
    adapterStubId:adapter?.id || input.adapterStubId,
    invocationEnvelopeId:adapter?.invocationEnvelopeId,
    decision,
    readinessMode:"provider_invocation_readiness_preflight_no_provider_call",
    readinessChecks:checks,
    operationalDefaults:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_boundary_violation",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"24.0", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, readinessPreflightOnly:true, noSecretValuesStored:true, noSecretValuesExposed:true },
  };
  appendPreflight(preflight);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:preflight.id,
    status:preflight.decision,
    riskLevel:"high",
    summary:"Provider Invocation Readiness Preflight: "+preflight.decision,
    metadata:{ source:"phase24.0-provider-invocation-readiness-preflight", preflightId:preflight.id, boundaryCheckId:preflight.boundaryCheckId, adapterStubId:preflight.adapterStubId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return preflight;
}
export function summarizeProviderInvocationReadinessPreflights(preflights:ProviderInvocationReadinessPreflight[]){ const byDecision:Record<string,number>={}; for(const preflight of preflights){ byDecision[preflight.decision]=(byDecision[preflight.decision]||0)+1; } return { total:preflights.length, byDecision }; }
`;
const api = String.raw`import { createProviderInvocationReadinessPreflight, listProviderInvocationReadinessPreflights, summarizeProviderInvocationReadinessPreflights } from "../../../lib/provider-invocation-readiness-preflight-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const preflights=listProviderInvocationReadinessPreflights(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderInvocationReadinessPreflights(preflights), preflights });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Invocation Readiness Preflights konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const preflight=createProviderInvocationReadinessPreflight({ boundaryCheckId: typeof body.boundaryCheckId==="string" ? body.boundaryCheckId : undefined, adapterStubId: typeof body.adapterStubId==="string" ? body.adapterStubId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, preflight });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Invocation Readiness Preflight konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Boundary={id:string;decision:string;timestamp:string};
type Adapter={id:string;decision:string;timestamp:string};
type Preflight={id:string;timestamp:string;decision:string;reason:string;readinessMode:string;readinessChecks:Array<{name:string;passed:boolean;reason:string}>;operationalDefaults:any;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderInvocationReadinessPreflightPage(){
 const [boundaries,setBoundaries]=useState<Boundary[]>([]); const [adapters,setAdapters]=useState<Adapter[]>([]); const [preflights,setPreflights]=useState<Preflight[]>([]); const [summary,setSummary]=useState<any>(null); const [boundaryId,setBoundaryId]=useState(""); const [adapterId,setAdapterId]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [bRes,aRes,pRes]=await Promise.all([fetch("/api/provider-config-secret-boundary?limit=100",{cache:"no-store"}),fetch("/api/provider-llm-adapter-stub?limit=100",{cache:"no-store"}),fetch("/api/provider-invocation-readiness-preflight?limit=100",{cache:"no-store"})]); const b=await bRes.json(); const a=await aRes.json(); const p=await pRes.json(); if(bRes.ok){ const list=Array.isArray(b.boundaryChecks)?b.boundaryChecks:[]; setBoundaries(list); if(!boundaryId && list[0]?.id) setBoundaryId(list[0].id); } if(aRes.ok){ const list=Array.isArray(a.adapterStubs)?a.adapterStubs:[]; setAdapters(list); if(!adapterId && list[0]?.id) setAdapterId(list[0].id); } if(!pRes.ok) throw new Error(p?.error||"Readiness Preflights konnten nicht geladen werden."); setPreflights(Array.isArray(p.preflights)?p.preflights:[]); setSummary(p.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createPreflight(){ const res=await fetch("/api/provider-invocation-readiness-preflight",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({boundaryCheckId:boundaryId,adapterStubId:adapterId})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Preflight fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-invocation-readiness-preflight" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Provider Invocation Readiness Preflight</h1><p style={{lineHeight:1.6}}>Phase 24.0 bereitet einen Readiness Preflight für spätere Provider Invocation vor. Keine Secrets, keine Provider-/Netzwerk-Aufrufe und kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Readiness Preflight erstellen</h2><label>Provider Config Boundary</label><select className="text-input" value={boundaryId} onChange={(ev)=>setBoundaryId(ev.target.value)}>{boundaries.map((b)=><option key={b.id} value={b.id}>{b.decision} · {b.id}</option>)}</select><label>Provider Adapter Stub</label><select className="text-input" value={adapterId} onChange={(ev)=>setAdapterId(ev.target.value)}>{adapters.map((a)=><option key={a.id} value={a.id}>{a.decision} · {a.id}</option>)}</select><button className="primary-button" type="button" onClick={createPreflight} disabled={!boundaryId || !adapterId}>Provider Invocation Readiness Preflight vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Readiness Preflights</h2>{preflights.length===0 ? <p>Noch keine Readiness Preflights.</p> : preflights.map((p)=><article key={p.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{p.readinessMode}</strong> <span className="chip">{p.decision}</span></div><div className="helper-text"><code>{p.id}</code> · {p.timestamp}</div><p><strong>Reason:</strong> {p.reason}</p><p><strong>No secrets:</strong> {String(p.noSecretsIncluded)} · <strong>Network call:</strong> {String(p.networkCallPerformed)} · <strong>Provider execution:</strong> {String(p.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(p.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(p.llmCallPerformed)} · <strong>Execution:</strong> {String(p.executionAllowed)} · <strong>Tool:</strong> {String(p.toolExecutionAllowed)} · <strong>Agent:</strong> {String(p.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(p.dryRunOnly)}</p><h3>Operational Defaults</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(p.operationalDefaults ?? {}, null, 2)}</pre><h3>Readiness Checks</h3><ul>{p.readinessChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-invocation-readiness-preflight"')){ const line='  { href: "/provider-invocation-readiness-preflight", label: "Provider Readiness", key: "provider-invocation-readiness-preflight" },'; const markers=['{ href: "/provider-config-dashboard", label: "Provider Config Dashboard", key: "provider-config-dashboard" },','{ href: "/provider-config-policy", label: "Provider Config Policy", key: "provider-config-policy" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Readiness Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Readiness bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase24-0-provider-invocation-readiness-preflight.md", `# Phase 24.0 – Provider Invocation Readiness Preflight / Still No Provider Call

## Ziel
Ein Readiness Preflight für spätere Provider Invocation wird vorbereitet. Es findet weiterhin kein Provider-/Netzwerk-Aufruf und kein produktiver LLM-Aufruf statt.

## Neue UI/API
- UI: /provider-invocation-readiness-preflight
- API: /api/provider-invocation-readiness-preflight
- Store: data/provider-invocation-readiness-preflights.jsonl

## Sicherheitsprinzip
- provider_invocation_readiness_preflight_no_provider_call
- Secret Boundary erneut geprüft
- Output Contract erneut geprüft
- Cost/RateLimit/Timeout Defaults nur als Metadata
- keine Secrets in UI, Logs oder JSONL Stores
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
Phase 24.1 kann Readiness Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase24-provider-invocation-readiness-preflight-runbook.md", `# Runbook – Phase 24.0 Provider Invocation Readiness Preflight

## Patch
\`\`\`powershell
npm run phase24:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase24-0-patch-provider-invocation-readiness-preflight.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase24:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-invocation-readiness-preflight-store.ts", store);
ensureFile("frontend/app/api/provider-invocation-readiness-preflight/route.ts", api);
ensureFile("frontend/app/provider-invocation-readiness-preflight/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 24.0 Patch abgeschlossen.");
