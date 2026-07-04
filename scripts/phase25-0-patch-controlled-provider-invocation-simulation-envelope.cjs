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
  pkg.scripts["phase25:0:patch"]="node scripts/phase25-0-patch-controlled-provider-invocation-simulation-envelope.cjs";
  pkg.scripts["phase25:0:verify"]="node scripts/phase25-0-verify-controlled-provider-invocation-simulation-envelope.cjs";
  pkg.scripts["llm:provider-simulation-envelope:verify"]="node scripts/phase25-0-verify-controlled-provider-invocation-simulation-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 25.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledProviderInvocationSimulationDecision =
  | "simulation_envelope_prepared_no_external_call"
  | "blocked_missing_readiness_preflight"
  | "blocked_secret_boundary_violation"
  | "blocked_network_or_provider_call"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation";

export interface ControlledProviderInvocationSimulationEnvelope {
  id: string;
  timestamp: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledProviderInvocationSimulationDecision;
  simulationMode: "controlled_provider_invocation_simulation_envelope_no_external_call";
  simulationChecks: Array<{ name: string; passed: boolean; reason: string }>;
  simulatedProviderRequest: {
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    promptIncluded: false;
    secretValuesIncluded: false;
    outputContractType: "recommendation_explanation_only";
  };
  simulatedProviderResponse: {
    responseType: "metadata_only_simulated_response";
    text: string;
    tokenUsageEstimated: false;
    costEstimated: false;
  };
  operationalMetadata: {
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
function preflightPath(): string { return path.join(dataDir(), "provider-invocation-readiness-preflights.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(env: ControlledProviderInvocationSimulationEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(env)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledProviderInvocationSimulationEnvelopes(limit=100): ControlledProviderInvocationSimulationEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledProviderInvocationSimulationEnvelope(input:{ preflightId?: string; metadata?: Record<string, unknown> }): ControlledProviderInvocationSimulationEnvelope {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const output=preflight?.outputContract || {};
  const defaults=preflight?.operationalDefaults || {};
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"readiness_preflight_exists", passed:Boolean(preflight), reason: preflight ? "Readiness Preflight gefunden." : "Readiness Preflight fehlt." });
  checks.push({ name:"readiness_preflight_no_provider_call", passed:preflight?.readinessMode === "provider_invocation_readiness_preflight_no_provider_call", reason:"Readiness Preflight muss no-provider-call bleiben." });
  checks.push({ name:"no_secret_values", passed:preflight?.noSecretsIncluded === true && !containsSecretValue(preflight), reason:"Keine Secret-Werte oder Secret-ähnlichen Werte dürfen enthalten sein." });
  checks.push({ name:"no_network_or_provider_call", passed:preflight?.networkCallPerformed === false && preflight?.providerExecutionAllowed === false, reason:"Provider-/Netzwerk-Aufruf muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed:preflight?.realLlmCallAllowed === false && preflight?.llmCallPerformed === false, reason:"Produktiver LLM-Aufruf muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed === false && preflight?.toolExecutionAllowed === false && preflight?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:preflight?.dryRunOnly === true, reason:preflight?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend bleiben." });
  checks.push({ name:"operational_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Defaults müssen metadata-only bleiben." });
  let decision: ControlledProviderInvocationSimulationDecision="simulation_envelope_prepared_no_external_call";
  let reason="Controlled Provider Invocation Simulation Envelope vorbereitet. Kein externer Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_readiness_preflight"; reason="Readiness Preflight nicht gefunden."; }
  else if(preflight.noSecretsIncluded !== true || containsSecretValue(preflight)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt oder Secret-ähnlicher Wert erkannt."; }
  else if(preflight.networkCallPerformed !== false || preflight.providerExecutionAllowed !== false){ decision="blocked_network_or_provider_call"; reason="Provider-/Netzwerk-Ausführung ist nicht eindeutig blockiert."; }
  else if(preflight.realLlmCallAllowed !== false || preflight.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Produktiver LLM-Aufruf ist nicht eindeutig blockiert."; }
  else if(preflight.executionAllowed !== false || preflight.toolExecutionAllowed !== false || preflight.agentExecutionAllowed !== false || preflight.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  const env: ControlledProviderInvocationSimulationEnvelope={
    id:makeId("provider-simulation-envelope"),
    timestamp:new Date().toISOString(),
    preflightId:preflight?.id || input.preflightId,
    boundaryCheckId:preflight?.boundaryCheckId,
    adapterStubId:preflight?.adapterStubId,
    invocationEnvelopeId:preflight?.invocationEnvelopeId,
    decision,
    simulationMode:"controlled_provider_invocation_simulation_envelope_no_external_call",
    simulationChecks:checks,
    simulatedProviderRequest:{ provider:"none", modelSelected:"none", networkCallAllowed:false, promptIncluded:false, secretValuesIncluded:false, outputContractType:"recommendation_explanation_only" },
    simulatedProviderResponse:{ responseType:"metadata_only_simulated_response", text:"No external provider call performed. This is a controlled metadata-only simulation envelope.", tokenUsageEstimated:false, costEstimated:false },
    operationalMetadata:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
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
    metadata:{ ...(input.metadata||{}), phase:"25.0", noExternalCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, simulationEnvelopeOnly:true },
  };
  appendEnvelope(env);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:env.id,
    status:env.decision,
    riskLevel:"high",
    summary:"Controlled Provider Invocation Simulation Envelope: "+env.decision,
    metadata:{ source:"phase25.0-controlled-provider-invocation-simulation-envelope", simulationEnvelopeId:env.id, preflightId:env.preflightId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return env;
}
export function summarizeControlledProviderInvocationSimulationEnvelopes(envelopes:ControlledProviderInvocationSimulationEnvelope[]){ const byDecision:Record<string,number>={}; for(const env of envelopes){ byDecision[env.decision]=(byDecision[env.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
`;
const api = String.raw`import { createControlledProviderInvocationSimulationEnvelope, listControlledProviderInvocationSimulationEnvelopes, summarizeControlledProviderInvocationSimulationEnvelopes } from "../../../lib/controlled-provider-invocation-simulation-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulationEnvelopes=listControlledProviderInvocationSimulationEnvelopes(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledProviderInvocationSimulationEnvelopes(simulationEnvelopes), simulationEnvelopes });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Simulation Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const simulationEnvelope=createControlledProviderInvocationSimulationEnvelope({ preflightId: typeof body.preflightId==="string" ? body.preflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulationEnvelope });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Simulation Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Preflight={id:string;decision:string;timestamp:string;readinessMode:string};
type Env={id:string;timestamp:string;decision:string;reason:string;simulationMode:string;simulationChecks:Array<{name:string;passed:boolean;reason:string}>;simulatedProviderRequest:any;simulatedProviderResponse:any;operationalMetadata:any;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ControlledProviderInvocationSimulationEnvelopePage(){
 const [preflights,setPreflights]=useState<Preflight[]>([]); const [envelopes,setEnvelopes]=useState<Env[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,eRes]=await Promise.all([fetch("/api/provider-invocation-readiness-preflight?limit=100",{cache:"no-store"}),fetch("/api/controlled-provider-invocation-simulation-envelope?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const e=await eRes.json(); if(pRes.ok){ const list=Array.isArray(p.preflights)?p.preflights:[]; setPreflights(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!eRes.ok) throw new Error(e?.error||"Simulation Envelopes konnten nicht geladen werden."); setEnvelopes(Array.isArray(e.simulationEnvelopes)?e.simulationEnvelopes:[]); setSummary(e.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/controlled-provider-invocation-simulation-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({preflightId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="controlled-provider-invocation-simulation-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Controlled Provider Invocation Simulation Envelope</h1><p style={{lineHeight:1.6}}>Phase 25.0 bereitet eine kontrollierte Provider Invocation Simulation Envelope vor. Keine echten Provider-/Netzwerk-Aufrufe, keine Tool-/Agent-Ausführung, Response nur simuliert/metadata-only.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Simulation Envelope erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{preflights.map((p)=><option key={p.id} value={p.id}>{p.readinessMode} · {p.decision} · {p.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Controlled Provider Simulation Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Simulation Envelopes</h2>{envelopes.length===0 ? <p>Noch keine Simulation Envelopes.</p> : envelopes.map((env)=><article key={env.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{env.simulationMode}</strong> <span className="chip">{env.decision}</span></div><div className="helper-text"><code>{env.id}</code> · {env.timestamp}</div><p><strong>Reason:</strong> {env.reason}</p><p><strong>No secrets:</strong> {String(env.noSecretsIncluded)} · <strong>Network call:</strong> {String(env.networkCallPerformed)} · <strong>Provider execution:</strong> {String(env.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(env.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(env.llmCallPerformed)} · <strong>Execution:</strong> {String(env.executionAllowed)} · <strong>Tool:</strong> {String(env.toolExecutionAllowed)} · <strong>Agent:</strong> {String(env.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(env.dryRunOnly)}</p><h3>Simulated Provider Request</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env.simulatedProviderRequest ?? {}, null, 2)}</pre><h3>Simulated Provider Response</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env.simulatedProviderResponse ?? {}, null, 2)}</pre><h3>Operational Metadata</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env.operationalMetadata ?? {}, null, 2)}</pre><ul>{env.simulationChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "controlled-provider-invocation-simulation-envelope"')){ const line='  { href: "/controlled-provider-invocation-simulation-envelope", label: "Provider Simulation", key: "controlled-provider-invocation-simulation-envelope" },'; const markers=['{ href: "/provider-readiness-dashboard", label: "Readiness Dashboard", key: "provider-readiness-dashboard" },','{ href: "/provider-readiness-policy", label: "Readiness Policy", key: "provider-readiness-policy" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Simulation Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Simulation bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase25-0-controlled-provider-invocation-simulation-envelope.md", `# Phase 25.0 – Controlled Provider Invocation Simulation Envelope / Still No External Call

## Ziel
Eine kontrollierte Provider Invocation Simulation Envelope wird vorbereitet. Es findet kein externer Provider-/Netzwerk-Aufruf statt.

## Neue UI/API
- UI: /controlled-provider-invocation-simulation-envelope
- API: /api/controlled-provider-invocation-simulation-envelope
- Store: data/controlled-provider-invocation-simulation-envelopes.jsonl

## Sicherheitsprinzip
- controlled_provider_invocation_simulation_envelope_no_external_call
- keine echten Provider Calls
- keine Netzwerk Calls
- Response nur simuliert/metadata-only
- Readiness Preflight als Input
- Provider Config Boundary als Input über Preflight
- Adapter Stub als Input über Preflight
- Cost/RateLimit/Timeout Metadata übernehmen
- Audit vor/nach Simulation
- keine Tool-Ausführung
- keine Agent-Ausführung
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 25.1 kann Provider Simulation Policy & Audit ergänzen.
`);
ensureFile("docs/phase25-controlled-provider-invocation-simulation-envelope-runbook.md", `# Runbook – Phase 25.0 Controlled Provider Invocation Simulation Envelope

## Patch
\`\`\`powershell
npm run phase25:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase25-0-patch-controlled-provider-invocation-simulation-envelope.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase25:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-provider-invocation-simulation-envelope-store.ts", store);
ensureFile("frontend/app/api/controlled-provider-invocation-simulation-envelope/route.ts", api);
ensureFile("frontend/app/controlled-provider-invocation-simulation-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 25.0 Patch abgeschlossen.");
