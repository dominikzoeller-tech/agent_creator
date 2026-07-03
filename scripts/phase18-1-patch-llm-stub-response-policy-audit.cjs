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
  pkg.scripts["phase18:1:patch"]="node scripts/phase18-1-patch-llm-stub-response-policy-audit.cjs";
  pkg.scripts["phase18:1:verify"]="node scripts/phase18-1-verify-llm-stub-response-policy-audit.cjs";
  pkg.scripts["llm:stub:policy:verify"]="node scripts/phase18-1-verify-llm-stub-response-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 18.1 Scripts eingetragen.");
}
const store=String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
`;
const api=String.raw`import { listControlledLlmStubPolicySimulations, simulateControlledLlmStubPolicy, summarizeControlledLlmStubPolicySimulations } from "../../../lib/controlled-llm-stub-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listControlledLlmStubPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledLlmStubPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Stub Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateControlledLlmStubPolicy({ responseId: typeof body.responseId==="string" ? body.responseId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Stub Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Resp={id:string;decision:string;actionType?:string;timestamp:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;llmCallPerformed:boolean;stubOnly:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function LlmStubPolicyPage(){
 const [responses,setResponses]=useState<Resp[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,sRes]=await Promise.all([fetch("/api/llm-stub-response?limit=100",{cache:"no-store"}),fetch("/api/llm-stub-policy?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const s=await sRes.json(); if(rRes.ok){ const list=Array.isArray(r.responses)?r.responses:[]; setResponses(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Stub Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/llm-stub-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({responseId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="llm-stub-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">LLM Stub Policy</h1><p style={{lineHeight:1.6}}>Phase 18.1 simuliert Policy Checks für Dry-run Explainer Responses und schreibt Audit Events. Kein LLM-Aufruf, keine Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{responses.map((resp)=><option key={resp.id} value={resp.id}>{resp.actionType || "llm-stub"} · {resp.decision} · {resp.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Stub Response Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Stub Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "llm-stub-policy"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Stub:</strong> {String(sim.stubOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "llm-stub-policy"')){ const marker='{ href: "/llm-stub-response", label: "LLM Stub", key: "llm-stub-response" },'; const line='  { href: "/llm-stub-policy", label: "Stub Policy", key: "llm-stub-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Stub Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Stub Policy bereits vorhanden."); }
function patchDocs(){ ensureFile("phase18-1-stub-response-policy-simulation-audit.md", `# Phase 18.1 – Stub Response Policy Simulation & Audit

## Ziel
Dry-run Explainer Responses werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /llm-stub-policy
- API: /api/llm-stub-policy
- Store: data/controlled-llm-stub-policy-simulations.jsonl

## Sicherheitsprinzip
- kein LLM-Aufruf
- llmCallPerformed=false
- stubOnly=true
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- kein Secret-Leak
- explanation-only output
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 18.2 kann LLM Stub Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase18-stub-response-policy-simulation-audit-runbook.md", `# Runbook – Phase 18.1 Stub Response Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase18:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase18-1-patch-llm-stub-response-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase18:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-llm-stub-policy-store.ts", store);
ensureFile("frontend/app/api/llm-stub-policy/route.ts", api);
ensureFile("frontend/app/llm-stub-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 18.1 Patch abgeschlossen.");
