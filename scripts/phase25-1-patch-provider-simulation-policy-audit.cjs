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
  pkg.scripts["phase25:1:patch"]="node scripts/phase25-1-patch-provider-simulation-policy-audit.cjs";
  pkg.scripts["phase25:1:verify"]="node scripts/phase25-1-verify-provider-simulation-policy-audit.cjs";
  pkg.scripts["llm:provider-simulation:policy:verify"]="node scripts/phase25-1-verify-provider-simulation-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 25.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledProviderSimulationPolicyDecision =
  | "simulation_allowed_metadata_only"
  | "blocked_missing_simulation_envelope"
  | "blocked_external_call_risk"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_response_contract_violation";

export interface ControlledProviderSimulationPolicySimulation {
  id: string;
  timestamp: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledProviderSimulationPolicyDecision;
  simulationMode: "controlled_provider_invocation_simulation_envelope_no_external_call";
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
function envelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ControlledProviderSimulationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledProviderSimulationPolicySimulations(limit=100): ControlledProviderSimulationPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateControlledProviderSimulationPolicy(input:{ simulationEnvelopeId?: string; metadata?: Record<string, unknown> }): ControlledProviderSimulationPolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.simulationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.simulationEnvelopeId) : envelopes[0];
  const request=envelope?.simulatedProviderRequest || {};
  const response=envelope?.simulatedProviderResponse || {};
  const output=envelope?.outputContract || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"simulation_envelope_exists", passed:Boolean(envelope), reason: envelope ? "Simulation Envelope gefunden." : "Simulation Envelope fehlt." });
  checks.push({ name:"simulation_mode_no_external_call", passed:envelope?.simulationMode === "controlled_provider_invocation_simulation_envelope_no_external_call", reason:"Simulation muss no-external-call bleiben." });
  checks.push({ name:"provider_none", passed:request.provider === "none" && request.modelSelected === "none", reason:"Provider und Modell müssen none bleiben." });
  checks.push({ name:"network_blocked", passed:request.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung muss blockiert bleiben." });
  checks.push({ name:"prompt_and_secrets_excluded", passed:request.promptIncluded === false && request.secretValuesIncluded === false && envelope?.noSecretsIncluded === true && !containsSecretValue(envelope), reason:"Prompt und Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"response_metadata_only", passed:response.responseType === "metadata_only_simulated_response" && response.tokenUsageEstimated === false && response.costEstimated === false, reason:"Response muss simuliert und metadata-only sein." });
  checks.push({ name:"real_llm_blocked", passed:envelope?.realLlmCallAllowed === false && envelope?.llmCallPerformed === false, reason:"Produktiver LLM-Aufruf muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed:envelope?.dryRunOnly === true, reason:envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend bleiben." });
  let decision:ControlledProviderSimulationPolicyDecision="simulation_allowed_metadata_only";
  let reason="Provider Simulation Policy erlaubt nur metadata-only Simulation. Kein externer Provider-/Netzwerk-Aufruf.";
  if(!envelope){ decision="blocked_missing_simulation_envelope"; reason="Simulation Envelope nicht gefunden."; }
  else if(request.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || request.provider !== "none" || request.modelSelected !== "none"){ decision="blocked_external_call_risk"; reason="External-Call-Risiko erkannt."; }
  else if(envelope.noSecretsIncluded !== true || request.promptIncluded !== false || request.secretValuesIncluded !== false || containsSecretValue(envelope)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(envelope.realLlmCallAllowed !== false || envelope.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Produktiver LLM-Aufruf ist nicht eindeutig blockiert."; }
  else if(envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="response_metadata_only")?.passed !== true){ decision="blocked_response_contract_violation"; reason="Response Contract ist nicht metadata-only."; }
  const sim:ControlledProviderSimulationPolicySimulation={
    id:makeId("provider-simulation-policy-sim"),
    timestamp:new Date().toISOString(),
    simulationEnvelopeId:envelope?.id || input.simulationEnvelopeId,
    preflightId:envelope?.preflightId,
    boundaryCheckId:envelope?.boundaryCheckId,
    adapterStubId:envelope?.adapterStubId,
    invocationEnvelopeId:envelope?.invocationEnvelopeId,
    decision,
    simulationMode:"controlled_provider_invocation_simulation_envelope_no_external_call",
    policyChecks:checks,
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
    metadata:{ ...(input.metadata||{}), phase:"25.1", noExternalCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, simulationPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.simulationEnvelopeId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Controlled Provider Simulation Policy: "+sim.decision,
    metadata:{ source:"phase25.1-provider-simulation-policy", simulationId:sim.id, simulationEnvelopeId:sim.simulationEnvelopeId, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeControlledProviderSimulationPolicySimulations(sims:ControlledProviderSimulationPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listControlledProviderSimulationPolicySimulations, simulateControlledProviderSimulationPolicy, summarizeControlledProviderSimulationPolicySimulations } from "../../../lib/controlled-provider-invocation-simulation-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listControlledProviderSimulationPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeControlledProviderSimulationPolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Provider Simulation Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateControlledProviderSimulationPolicy({ simulationEnvelopeId: typeof body.simulationEnvelopeId==="string" ? body.simulationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Provider Simulation Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;timestamp:string;simulationMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;simulationMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ControlledProviderSimulationPolicyPage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,sRes]=await Promise.all([fetch("/api/controlled-provider-invocation-simulation-envelope?limit=100",{cache:"no-store"}),fetch("/api/controlled-provider-invocation-simulation-policy?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const s=await sRes.json(); if(eRes.ok){ const list=Array.isArray(e.simulationEnvelopes)?e.simulationEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/controlled-provider-invocation-simulation-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({simulationEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="controlled-provider-invocation-simulation-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Provider Simulation Policy</h1><p style={{lineHeight:1.6}}>Phase 25.1 simuliert Policy Checks für Controlled Provider Invocation Simulation Envelopes. Kein externer Provider-/Netzwerk-Aufruf und Response nur metadata-only.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.simulationMode} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Simulation Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.simulationMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "controlled-provider-invocation-simulation-policy"')){ const marker='{ href: "/controlled-provider-invocation-simulation-envelope", label: "Provider Simulation", key: "controlled-provider-invocation-simulation-envelope" },'; const line='  { href: "/controlled-provider-invocation-simulation-policy", label: "Simulation Policy", key: "controlled-provider-invocation-simulation-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Simulation Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Simulation Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase25-1-provider-simulation-policy-audit.md", `# Phase 25.1 – Provider Simulation Policy & Audit

## Ziel
Controlled Provider Invocation Simulation Envelopes werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /controlled-provider-invocation-simulation-policy
- API: /api/controlled-provider-invocation-simulation-policy
- Store: data/controlled-provider-invocation-simulation-policy-simulations.jsonl

## Sicherheitsprinzip
- metadata-only Simulation
- kein externer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- promptIncluded=false
- secretValuesIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- keine Tool-Ausführung
- keine Agent-Ausführung
- dryRunOnly=true

## Nächster Schritt
Phase 25.2 kann Provider Simulation Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase25-provider-simulation-policy-audit-runbook.md", `# Runbook – Phase 25.1 Provider Simulation Policy & Audit

## Patch
\`\`\`powershell
npm run phase25:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase25-1-patch-provider-simulation-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase25:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-provider-invocation-simulation-policy-store.ts", store);
ensureFile("frontend/app/api/controlled-provider-invocation-simulation-policy/route.ts", api);
ensureFile("frontend/app/controlled-provider-invocation-simulation-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 25.1 Patch abgeschlossen.");
