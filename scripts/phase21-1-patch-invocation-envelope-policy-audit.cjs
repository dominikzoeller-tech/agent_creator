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
  pkg.scripts["phase21:1:patch"]="node scripts/phase21-1-patch-invocation-envelope-policy-audit.cjs";
  pkg.scripts["phase21:1:verify"]="node scripts/phase21-1-verify-invocation-envelope-policy-audit.cjs";
  pkg.scripts["llm:approved-envelope:policy:verify"]="node scripts/phase21-1-verify-invocation-envelope-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 21.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type InvocationEnvelopePolicyDecision =
  | "simulation_allowed_envelope_only"
  | "blocked_missing_invocation_envelope"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation"
  | "blocked_consent_state_invalid";

export interface InvocationEnvelopePolicySimulation {
  id: string;
  timestamp: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: InvocationEnvelopePolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  consentRequired: true;
  humanApprovalRequired: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: InvocationEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listInvocationEnvelopePolicySimulations(limit=100): InvocationEnvelopePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateInvocationEnvelopePolicy(input:{ invocationEnvelopeId?: string; metadata?: Record<string, unknown> }): InvocationEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const env=input.invocationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.invocationEnvelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"invocation_envelope_exists", passed:Boolean(env), reason: env ? "Invocation Envelope gefunden." : "Invocation Envelope fehlt." });
  checks.push({ name:"prep_only_mode", passed: env?.invocationEnvelope?.mode === "approved_invocation_envelope_prep_only", reason:"Envelope muss Prep-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed: env?.realLlmCallAllowed === false && env?.llmCallPerformed === false && env?.invocationEnvelope?.realLlmCallAllowed === false, reason:"Real LLM Call muss blockiert bleiben." });
  checks.push({ name:"consent_required", passed: env?.consentRequired === true && env?.humanApprovalRequired === true, reason:"Consent und Human Approval müssen verpflichtend bleiben." });
  checks.push({ name:"consent_state_valid", passed: env?.approvalState?.acceptedForEnvelopePrep === true && env?.approvalState?.notExpired === true, reason:"Consent muss für Envelope Prep akzeptiert und nicht abgelaufen sein." });
  checks.push({ name:"execution_blocked", passed: env?.executionAllowed === false && env?.toolExecutionAllowed === false && env?.agentExecutionAllowed === false && env?.invocationEnvelope?.toolExecutionAllowed === false && env?.invocationEnvelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: env?.dryRunOnly === true, reason: env?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"final_secret_scan", passed: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview), reason: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_locked", passed: env?.outputContract?.outputType === "recommendation_explanation_only" && env?.outputContract?.mayExecuteTools === false && env?.outputContract?.mayExecuteAgents === false && env?.outputContract?.mayRevealSecrets === false && env?.outputContract?.mayChangeState === false && env?.invocationEnvelope?.outputContractLocked === true, reason:"Output Contract muss locked, explanation-only und nicht-ausführend sein." });
  checks.push({ name:"audit_before_invocation_required", passed: env?.invocationEnvelope?.auditBeforeInvocationRequired === true, reason:"Audit vor Invocation bleibt erforderlich." });
  let decision: InvocationEnvelopePolicyDecision="simulation_allowed_envelope_only";
  let reason="Invocation Envelope Policy Simulation erlaubt nur Envelope/Prep. Kein produktiver LLM-Aufruf.";
  if(!env){ decision="blocked_missing_invocation_envelope"; reason="Invocation Envelope nicht gefunden."; }
  else if(env.realLlmCallAllowed !== false || env.llmCallPerformed !== false || env.invocationEnvelope?.realLlmCallAllowed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(env.executionAllowed !== false || env.toolExecutionAllowed !== false || env.agentExecutionAllowed !== false || env.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Execution Safety Invariants."; }
  else if(env.noSecretsIncluded !== true || containsSecretPattern(env.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Invocation Envelope erkannt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract ist nicht korrekt locked/explanation-only."; }
  else if(env.approvalState?.acceptedForEnvelopePrep !== true || env.approvalState?.notExpired !== true){ decision="blocked_consent_state_invalid"; reason="Consent State ist nicht gültig für Envelope Prep."; }
  const sim: InvocationEnvelopePolicySimulation={
    id:makeId("approved-envelope-policy-sim"),
    timestamp:new Date().toISOString(),
    invocationEnvelopeId:env?.id || input.invocationEnvelopeId,
    consentRequestId:env?.consentRequestId,
    gateId:env?.gateId,
    responseId:env?.responseId,
    envelopeId:env?.envelopeId,
    recommendationId:env?.recommendationId,
    actionType:env?.actionType,
    decision,
    policyChecks:checks,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"21.1", noExecution:true, noRealLlmCall:true, envelopePolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.invocationEnvelopeId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Invocation Envelope Policy Simulation: "+sim.decision,
    metadata:{ source:"phase21.1-invocation-envelope-policy", simulationId:sim.id, invocationEnvelopeId:sim.invocationEnvelopeId, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false },
  });
  return sim;
}
export function summarizeInvocationEnvelopePolicySimulations(sims:InvocationEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listInvocationEnvelopePolicySimulations, simulateInvocationEnvelopePolicy, summarizeInvocationEnvelopePolicySimulations } from "../../../lib/approved-real-llm-invocation-envelope-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listInvocationEnvelopePolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeInvocationEnvelopePolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Invocation Envelope Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateInvocationEnvelopePolicy({ invocationEnvelopeId: typeof body.invocationEnvelopeId==="string" ? body.invocationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Invocation Envelope Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;actionType?:string;timestamp:string};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;consentRequired:boolean;humanApprovalRequired:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;policyChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function InvocationEnvelopePolicyPage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,sRes]=await Promise.all([fetch("/api/approved-real-llm-invocation-envelope?limit=100",{cache:"no-store"}),fetch("/api/approved-real-llm-invocation-envelope-policy?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const s=await sRes.json(); if(eRes.ok){ const list=Array.isArray(e.invocationEnvelopes)?e.invocationEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/approved-real-llm-invocation-envelope-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invocationEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approved-real-llm-invocation-envelope-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Invocation Envelope Policy</h1><p style={{lineHeight:1.6}}>Phase 21.1 simuliert Policy Checks für Approved Real LLM Invocation Envelopes. Kein produktiver LLM-Aufruf und keine Tool-/Agent-Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.actionType || "invocation-envelope"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Invocation Envelope Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "invocation-envelope-policy"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>Consent:</strong> {String(sim.consentRequired)} · <strong>Human approval:</strong> {String(sim.humanApprovalRequired)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approved-real-llm-invocation-envelope-policy"')){ const marker='{ href: "/approved-real-llm-invocation-envelope", label: "Invocation Envelope", key: "approved-real-llm-invocation-envelope" },'; const line='  { href: "/approved-real-llm-invocation-envelope-policy", label: "Envelope Policy", key: "approved-real-llm-invocation-envelope-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Envelope Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Envelope Policy bereits vorhanden."); }
function patchDocs(){ ensureFile("phase21-1-invocation-envelope-policy-simulation-audit.md", `# Phase 21.1 – Invocation Envelope Policy Simulation & Audit

## Ziel
Approved Real LLM Invocation Envelopes werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /approved-real-llm-invocation-envelope-policy
- API: /api/approved-real-llm-invocation-envelope-policy
- Store: data/approved-real-llm-invocation-envelope-policy-simulations.jsonl

## Sicherheitsprinzip
- nur Envelope/Prep
- kein produktiver LLM-Aufruf
- realLlmCallAllowed=false
- llmCallPerformed=false
- consentRequired=true
- humanApprovalRequired=true
- Output Contract locked
- finaler Secret Scan
- Audit vor Invocation erforderlich
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 21.2 kann Invocation Envelope Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase21-invocation-envelope-policy-simulation-audit-runbook.md", `# Runbook – Phase 21.1 Invocation Envelope Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase21:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase21-1-patch-invocation-envelope-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase21:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/approved-real-llm-invocation-envelope-policy-store.ts", store);
ensureFile("frontend/app/api/approved-real-llm-invocation-envelope-policy/route.ts", api);
ensureFile("frontend/app/approved-real-llm-invocation-envelope-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 21.1 Patch abgeschlossen.");
