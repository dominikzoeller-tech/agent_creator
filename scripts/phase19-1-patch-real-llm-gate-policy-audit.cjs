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
  pkg.scripts["phase19:1:patch"]="node scripts/phase19-1-patch-real-llm-gate-policy-audit.cjs";
  pkg.scripts["phase19:1:verify"]="node scripts/phase19-1-verify-real-llm-gate-policy-audit.cjs";
  pkg.scripts["llm:real-gate:policy:verify"]="node scripts/phase19-1-verify-real-llm-gate-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 19.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmGatePolicyDecision =
  | "simulation_allowed_gate_only"
  | "blocked_missing_gate"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_missing_required_gate";

export interface ControlledRealLlmGatePolicySimulation {
  id: string;
  timestamp: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmGatePolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmCallPerformed: false;
  realLlmCallAllowed: false;
  policyGateRequired: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function simulationsPath(): string { return path.join(dataDir(), "controlled-real-llm-gate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ControlledRealLlmGatePolicySimulation): void { ensureStore(); appendFileSync(simulationsPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listControlledRealLlmGatePolicySimulations(limit=100): ControlledRealLlmGatePolicySimulation[] { ensureStore(); return readJsonl(simulationsPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateControlledRealLlmGatePolicy(input:{ gateId?: string; metadata?: Record<string, unknown> }): ControlledRealLlmGatePolicySimulation {
  ensureStore();
  const gates=readJsonl(gatesPath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"gate_exists", passed:Boolean(gate), reason: gate ? "Real LLM Call Gate gefunden." : "Real LLM Call Gate fehlt." });
  checks.push({ name:"real_llm_not_allowed", passed: gate?.realLlmCallAllowed === false, reason: gate?.realLlmCallAllowed === false ? "Real LLM Call bleibt blockiert." : "Real LLM Call wäre erlaubt." });
  checks.push({ name:"llm_call_not_performed", passed: gate?.llmCallPerformed === false, reason: gate?.llmCallPerformed === false ? "Kein LLM-Aufruf erfolgt." : "LLM-Aufruf wurde durchgeführt." });
  checks.push({ name:"policy_gate_required", passed: gate?.policyGateRequired === true && gate?.invocationPlan?.policyGateRequired === true, reason: "Policy Gate muss vor Invocation verpflichtend sein." });
  checks.push({ name:"secret_scan_required", passed: gate?.invocationPlan?.secretScanRequired === true, reason: "Secret Scan muss vor Invocation verpflichtend sein." });
  checks.push({ name:"output_contract_required", passed: gate?.invocationPlan?.outputContractRequired === true, reason: "Output Contract muss vor Invocation verpflichtend sein." });
  checks.push({ name:"audit_required", passed: gate?.invocationPlan?.auditRequiredBeforeCall === true && gate?.invocationPlan?.auditRequiredAfterDecision === true, reason: "Audit muss vor Call und nach Entscheidung verpflichtend sein." });
  checks.push({ name:"execution_blocked", passed: gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason: "Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"no_secret_risk", passed: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview), reason: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  let decision: RealLlmGatePolicyDecision="simulation_allowed_gate_only";
  let reason="Real LLM Gate Policy Simulation erlaubt nur Gate-Prep. Kein produktiver LLM-Aufruf.";
  if(!gate){ decision="blocked_missing_gate"; reason="Real LLM Call Gate nicht gefunden."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Gate verletzt Execution Safety Invariants."; }
  else if(gate.noSecretsIncluded !== true || containsSecretPattern(gate.sanitizedPromptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Real LLM Gate erkannt."; }
  else if(checks.some((check)=>check.passed !== true)){ decision="blocked_missing_required_gate"; reason="Mindestens ein verpflichtendes Gate fehlt."; }
  const sim: ControlledRealLlmGatePolicySimulation={
    id:makeId("real-llm-gate-policy-sim"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    responseId:gate?.responseId,
    envelopeId:gate?.envelopeId,
    recommendationId:gate?.recommendationId,
    actionType:gate?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmCallPerformed:false,
    realLlmCallAllowed:false,
    policyGateRequired:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"19.1", noExecution:true, noRealLlmCall:true, policyGateRequired:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.gateId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Controlled Real LLM Gate Policy Simulation: "+sim.decision,
    metadata:{ source:"phase19.1-real-llm-gate-policy", simulationId:sim.id, realLlmCallAllowed:false, llmCallPerformed:false, policyGateRequired:true, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false },
  });
  return sim;
}
export function summarizeControlledRealLlmGatePolicySimulations(sims:ControlledRealLlmGatePolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listControlledRealLlmGatePolicySimulations, simulateControlledRealLlmGatePolicy, summarizeControlledRealLlmGatePolicySimulations } from "../../../lib/controlled-real-llm-gate-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listControlledRealLlmGatePolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledRealLlmGatePolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Gate Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateControlledRealLlmGatePolicy({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Gate Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;actionType?:string;timestamp:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;realLlmCallAllowed:boolean;policyGateRequired:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function RealLlmGatePolicyPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,sRes]=await Promise.all([fetch("/api/real-llm-call-gate?limit=100",{cache:"no-store"}),fetch("/api/real-llm-gate-policy?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const s=await sRes.json(); if(gRes.ok){ const list=Array.isArray(g.gates)?g.gates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Real LLM Gate Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/real-llm-gate-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="real-llm-gate-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Real LLM Gate Policy</h1><p style={{lineHeight:1.6}}>Phase 19.1 simuliert Policy Checks für Real LLM Call Gates und schreibt Audit Events. Kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.actionType || "real-llm-gate"} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Real LLM Gate Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Real LLM Gate Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "real-llm-policy"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>Policy Gate:</strong> {String(sim.policyGateRequired)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "real-llm-gate-policy"')){ const marker='{ href: "/real-llm-call-gate", label: "Real LLM Gate", key: "real-llm-call-gate" },'; const line='  { href: "/real-llm-gate-policy", label: "Real LLM Policy", key: "real-llm-gate-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real LLM Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real LLM Policy bereits vorhanden."); }
function patchDocs(){ ensureFile("phase19-1-real-llm-gate-policy-simulation-audit.md", `# Phase 19.1 – Real LLM Gate Policy Simulation & Audit

## Ziel
Controlled Real LLM Call Gates werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /real-llm-gate-policy
- API: /api/real-llm-gate-policy
- Store: data/controlled-real-llm-gate-policy-simulations.jsonl

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf
- realLlmCallAllowed=false
- llmCallPerformed=false
- policyGateRequired=true
- Secret Scan erforderlich
- Output Contract erforderlich
- Audit vor/nach Call-Entscheidung erforderlich
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 19.2 kann Real LLM Gate Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase19-real-llm-gate-policy-simulation-audit-runbook.md", `# Runbook – Phase 19.1 Real LLM Gate Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase19:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase19-1-patch-real-llm-gate-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase19:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-real-llm-gate-policy-store.ts", store);
ensureFile("frontend/app/api/real-llm-gate-policy/route.ts", api);
ensureFile("frontend/app/real-llm-gate-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 19.1 Patch abgeschlossen.");
