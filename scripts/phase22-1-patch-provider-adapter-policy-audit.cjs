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
  pkg.scripts["phase22:1:patch"]="node scripts/phase22-1-patch-provider-adapter-policy-audit.cjs";
  pkg.scripts["phase22:1:verify"]="node scripts/phase22-1-verify-provider-adapter-policy-audit.cjs";
  pkg.scripts["llm:provider-stub:policy:verify"]="node scripts/phase22-1-verify-provider-adapter-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 22.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderAdapterPolicyDecision =
  | "simulation_allowed_stub_only"
  | "blocked_missing_provider_stub"
  | "blocked_network_call_detected"
  | "blocked_provider_execution_allowed"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation";

export interface ProviderAdapterPolicySimulation {
  id: string;
  timestamp: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ProviderAdapterPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  adapterMode: "provider_agnostic_no_network_stub";
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function stubPath(): string { return path.join(dataDir(), "provider-agnostic-llm-invocation-adapter-stubs.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-agnostic-llm-adapter-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ProviderAdapterPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listProviderAdapterPolicySimulations(limit=100): ProviderAdapterPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderAdapterPolicy(input:{ adapterStubId?: string; metadata?: Record<string, unknown> }): ProviderAdapterPolicySimulation {
  ensureStore();
  const stubs=readJsonl(stubPath());
  const stub=input.adapterStubId ? stubs.find((entry:any)=>entry.id===input.adapterStubId) : stubs[0];
  const promptPreview=stub?.providerRequestPreview?.promptPreview;
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"provider_stub_exists", passed:Boolean(stub), reason: stub ? "Provider Adapter Stub gefunden." : "Provider Adapter Stub fehlt." });
  checks.push({ name:"adapter_stub_only", passed: stub?.adapterMode === "provider_agnostic_no_network_stub" && stub?.adapterResponsePreview?.responseType === "stub_only", reason:"Adapter muss provider-agnostic no-network stub-only sein." });
  checks.push({ name:"network_not_performed", passed: stub?.networkCallPerformed === false && stub?.providerRequestPreview?.networkCallAllowed === false, reason:"Netzwerk-/Provider-Aufruf muss blockiert bleiben." });
  checks.push({ name:"provider_none", passed: stub?.providerRequestPreview?.provider === "none" && stub?.providerRequestPreview?.modelSelected === "none", reason:"Kein Provider und kein Modell dürfen ausgewählt sein." });
  checks.push({ name:"provider_execution_blocked", passed: stub?.providerExecutionAllowed === false, reason:"Provider Execution muss blockiert bleiben." });
  checks.push({ name:"real_llm_blocked", passed: stub?.realLlmCallAllowed === false && stub?.llmCallPerformed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: stub?.executionAllowed === false && stub?.toolExecutionAllowed === false && stub?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: stub?.dryRunOnly === true, reason: stub?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: stub?.noSecretsIncluded === true && !containsSecretPattern(promptPreview), reason: stub?.noSecretsIncluded === true && !containsSecretPattern(promptPreview) ? "Kein Secret-Risiko im Provider Request Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract", passed: stub?.providerRequestPreview?.outputContractType === "recommendation_explanation_only", reason:"Output Contract muss recommendation_explanation_only bleiben." });
  let decision: ProviderAdapterPolicyDecision="simulation_allowed_stub_only";
  let reason="Provider Adapter Policy Simulation erlaubt nur Stub/no-network. Kein produktiver LLM-Aufruf.";
  if(!stub){ decision="blocked_missing_provider_stub"; reason="Provider Adapter Stub nicht gefunden."; }
  else if(stub.networkCallPerformed !== false || stub.providerRequestPreview?.networkCallAllowed !== false){ decision="blocked_network_call_detected"; reason="Netzwerk-/Provider-Aufruf wäre erlaubt oder wurde durchgeführt."; }
  else if(stub.providerExecutionAllowed !== false){ decision="blocked_provider_execution_allowed"; reason="Provider Execution ist nicht blockiert."; }
  else if(stub.realLlmCallAllowed !== false || stub.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(stub.executionAllowed !== false || stub.toolExecutionAllowed !== false || stub.agentExecutionAllowed !== false || stub.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Adapter Stub verletzt Execution Safety Invariants."; }
  else if(stub.noSecretsIncluded !== true || containsSecretPattern(promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Provider Request Preview erkannt."; }
  else if(stub.providerRequestPreview?.outputContractType !== "recommendation_explanation_only"){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt recommendation_explanation_only."; }
  const sim: ProviderAdapterPolicySimulation={
    id:makeId("provider-adapter-policy-sim"),
    timestamp:new Date().toISOString(),
    adapterStubId:stub?.id || input.adapterStubId,
    invocationEnvelopeId:stub?.invocationEnvelopeId,
    consentRequestId:stub?.consentRequestId,
    gateId:stub?.gateId,
    responseId:stub?.responseId,
    envelopeId:stub?.envelopeId,
    recommendationId:stub?.recommendationId,
    actionType:stub?.actionType,
    decision,
    policyChecks:checks,
    adapterMode:"provider_agnostic_no_network_stub",
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"22.1", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, adapterPolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.adapterStubId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Provider Adapter Policy Simulation: "+sim.decision,
    metadata:{ source:"phase22.1-provider-adapter-policy", simulationId:sim.id, adapterStubId:sim.adapterStubId, networkCallPerformed:false, llmCallPerformed:false, realLlmCallAllowed:false },
  });
  return sim;
}
export function summarizeProviderAdapterPolicySimulations(sims:ProviderAdapterPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listProviderAdapterPolicySimulations, simulateProviderAdapterPolicy, summarizeProviderAdapterPolicySimulations } from "../../../lib/provider-agnostic-llm-adapter-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listProviderAdapterPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderAdapterPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateProviderAdapterPolicy({ adapterStubId: typeof body.adapterStubId==="string" ? body.adapterStubId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Stub={id:string;decision:string;actionType?:string;timestamp:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;adapterMode:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function ProviderAdapterPolicyPage(){
 const [stubs,setStubs]=useState<Stub[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [stRes,simRes]=await Promise.all([fetch("/api/provider-llm-adapter-stub?limit=100",{cache:"no-store"}),fetch("/api/provider-llm-adapter-policy?limit=100",{cache:"no-store"})]); const st=await stRes.json(); const sm=await simRes.json(); if(stRes.ok){ const list=Array.isArray(st.adapterStubs)?st.adapterStubs:[]; setStubs(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!simRes.ok) throw new Error(sm?.error||"Provider Adapter Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(sm.simulations)?sm.simulations:[]); setSummary(sm.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-llm-adapter-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adapterStubId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-llm-adapter-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Provider Adapter Policy</h1><p style={{lineHeight:1.6}}>Phase 22.1 simuliert Policy Checks für Provider Adapter Stubs. Kein Netzwerk-/Provider-Aufruf und kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{stubs.map((stub)=><option key={stub.id} value={stub.id}>{stub.actionType || "provider-stub"} · {stub.decision} · {stub.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Adapter Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "provider-policy"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Mode:</strong> {sim.adapterMode}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-llm-adapter-policy"')){ const marker='{ href: "/provider-llm-adapter-stub", label: "Provider Stub", key: "provider-llm-adapter-stub" },'; const line='  { href: "/provider-llm-adapter-policy", label: "Provider Policy", key: "provider-llm-adapter-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase22-1-provider-adapter-policy-simulation-audit.md", `# Phase 22.1 – Provider Adapter Policy Simulation & Audit

## Ziel
Provider-Agnostic LLM Invocation Adapter Stubs werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /provider-llm-adapter-policy
- API: /api/provider-llm-adapter-policy
- Store: data/provider-agnostic-llm-adapter-policy-simulations.jsonl

## Sicherheitsprinzip
- provider_agnostic_no_network_stub
- kein Netzwerk-/Provider-Aufruf
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- Secret Scan im Provider Request Preview
- Output Contract recommendation_explanation_only
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 22.2 kann Provider Adapter Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase22-provider-adapter-policy-simulation-audit-runbook.md", `# Runbook – Phase 22.1 Provider Adapter Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase22:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase22-1-patch-provider-adapter-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase22:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-agnostic-llm-adapter-policy-store.ts", store);
ensureFile("frontend/app/api/provider-llm-adapter-policy/route.ts", api);
ensureFile("frontend/app/provider-llm-adapter-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 22.1 Patch abgeschlossen.");
