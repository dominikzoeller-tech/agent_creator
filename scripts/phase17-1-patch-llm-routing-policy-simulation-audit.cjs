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
  pkg.scripts["phase17:1:patch"]="node scripts/phase17-1-patch-llm-routing-policy-simulation-audit.cjs";
  pkg.scripts["phase17:1:verify"]="node scripts/phase17-1-verify-llm-routing-policy-simulation-audit.cjs";
  pkg.scripts["llm:routing:policy:verify"]="node scripts/phase17-1-verify-llm-routing-policy-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 17.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type LlmRoutingPolicyDecision =
  | "simulation_allowed_explanation_only"
  | "blocked_missing_envelope"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation";

export interface LlmRoutingPolicySimulation {
  id: string;
  timestamp: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: LlmRoutingPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "controlled-llm-routing-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: LlmRoutingPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listLlmRoutingPolicySimulations(limit=100): LlmRoutingPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateLlmRoutingPolicy(input:{ envelopeId?: string; metadata?: Record<string, unknown> }): LlmRoutingPolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.envelopeId ? envelopes.find((entry:any)=>entry.id===input.envelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"envelope_exists", passed:Boolean(envelope), reason: envelope ? "LLM Routing Envelope gefunden." : "LLM Routing Envelope fehlt." });
  checks.push({ name:"execution_blocked", passed: envelope?.executionAllowed === false, reason: envelope?.executionAllowed === false ? "Execution bleibt blockiert." : "Execution wäre nicht blockiert." });
  checks.push({ name:"tool_execution_blocked", passed: envelope?.toolExecutionAllowed === false, reason: envelope?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name:"agent_execution_blocked", passed: envelope?.agentExecutionAllowed === false, reason: envelope?.agentExecutionAllowed === false ? "Agent-Ausführung bleibt blockiert." : "Agent-Ausführung wäre nicht blockiert." });
  checks.push({ name:"dry_run_only", passed: envelope?.dryRunOnly === true, reason: envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"llm_routing_prep_only", passed: envelope?.llmRoutingPrepOnly === true, reason: envelope?.llmRoutingPrepOnly === true ? "Nur LLM-Routing-Prep." : "LLM-Routing-Prep fehlt." });
  checks.push({ name:"no_secrets", passed: envelope?.noSecretsIncluded === true && !containsSecretPattern(envelope?.sanitizedContext), reason: envelope?.noSecretsIncluded === true && !containsSecretPattern(envelope?.sanitizedContext) ? "Sanitized Context enthält keine secret-artigen Muster." : "Secret-Risiko im Kontext." });
  checks.push({ name:"output_contract", passed: envelope?.allowedOutputContract?.outputType === "recommendation_explanation_only" && envelope?.allowedOutputContract?.mayExecuteTools === false && envelope?.allowedOutputContract?.mayExecuteAgents === false && envelope?.allowedOutputContract?.mayRevealSecrets === false && envelope?.allowedOutputContract?.mayChangeState === false, reason: "Output Contract muss Erklärung-only und nicht-ausführend sein." });
  let decision: LlmRoutingPolicyDecision="simulation_allowed_explanation_only";
  let reason="LLM Routing Policy Simulation erlaubt nur Empfehlung/Erklärung. Keine echte Ausführung und kein LLM-Aufruf.";
  if(!envelope){ decision="blocked_missing_envelope"; reason="LLM Routing Envelope nicht gefunden."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true || envelope.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="LLM Routing Envelope verletzt Safety Invariants."; }
  else if(envelope.noSecretsIncluded!==true || containsSecretPattern(envelope.sanitizedContext)){ decision="blocked_secret_risk"; reason="Sanitized Context enthält Secret-Risiko."; }
  else if(checks.find((c)=>c.name==="output_contract")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt Explanation-only-Regeln."; }
  const sim: LlmRoutingPolicySimulation={
    id: makeId("llm-policy-sim"),
    timestamp:new Date().toISOString(),
    envelopeId:envelope?.id || input.envelopeId,
    recommendationId:envelope?.recommendationId,
    actionType:envelope?.actionType,
    decision,
    policyChecks:checks,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"17.1", noExecution:true, noLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.envelopeId,
    status:sim.decision,
    riskLevel:"medium",
    summary:"Controlled LLM Routing Policy Simulation: "+sim.decision,
    metadata:{ source:"phase17.1-llm-routing-policy", simulationId:sim.id, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, llmRoutingPrepOnly:true },
  });
  return sim;
}
export function summarizeLlmRoutingPolicySimulations(sims: LlmRoutingPolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listLlmRoutingPolicySimulations, simulateLlmRoutingPolicy, summarizeLlmRoutingPolicySimulations } from "../../../lib/llm-routing-policy-simulation-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listLlmRoutingPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeLlmRoutingPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Routing Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateLlmRoutingPolicy({ envelopeId: typeof body.envelopeId==="string" ? body.envelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Routing Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;actionType?:string;timestamp:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;llmRoutingPrepOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function LlmRoutingPolicyPage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,sRes]=await Promise.all([fetch("/api/llm-routing-envelope?limit=100",{cache:"no-store"}),fetch("/api/llm-routing-policy?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const s=await sRes.json(); if(eRes.ok){ const list=Array.isArray(e.envelopes)?e.envelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"LLM Routing Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/llm-routing-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({envelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="llm-routing-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">LLM Routing Policy</h1><p style={{lineHeight:1.6}}>Phase 17.1 simuliert Policy Checks für Controlled LLM Routing Envelopes. Kein LLM-Aufruf, keine Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.actionType || "planner"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>LLM Routing Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine LLM Routing Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "llm-routing"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)} · <strong>LLM Routing Prep:</strong> {String(sim.llmRoutingPrepOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "llm-routing-policy"')){ const marker='{ href: "/llm-routing-envelope", label: "LLM Routing", key: "llm-routing-envelope" },'; const line='  { href: "/llm-routing-policy", label: "LLM Policy", key: "llm-routing-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: LLM Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: LLM Policy bereits vorhanden."); }
function patchDocs(){ ensureFile("phase17-1-llm-routing-policy-simulation-audit.md", `# Phase 17.1 – LLM Routing Policy Simulation & Audit

## Ziel
Controlled LLM Routing Envelopes werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /llm-routing-policy
- API: /api/llm-routing-policy
- Store: data/controlled-llm-routing-policy-simulations.jsonl

## Sicherheitsprinzip
- kein LLM-Aufruf
- keine echte Ausführung
- kein Secret-Leak
- Output Contract bleibt explanation-only
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Nächster Schritt
Phase 17.2 kann LLM Routing Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase17-llm-routing-policy-simulation-audit-runbook.md", `# Runbook – Phase 17.1 LLM Routing Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase17:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase17-1-patch-llm-routing-policy-simulation-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase17:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/llm-routing-policy-simulation-store.ts", store);
ensureFile("frontend/app/api/llm-routing-policy/route.ts", api);
ensureFile("frontend/app/llm-routing-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 17.1 Patch abgeschlossen.");
