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
  pkg.scripts["phase20:1:patch"]="node scripts/phase20-1-patch-real-llm-consent-decision-simulation-audit.cjs";
  pkg.scripts["phase20:1:verify"]="node scripts/phase20-1-verify-real-llm-consent-decision-simulation-audit.cjs";
  pkg.scripts["llm:real-consent:decision:verify"]="node scripts/phase20-1-verify-real-llm-consent-decision-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 20.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmConsentSimulationDecision =
  | "consent_decision_simulated_pending"
  | "blocked_missing_consent_request"
  | "blocked_not_pending"
  | "blocked_real_llm_allowed"
  | "blocked_missing_human_approval_requirement"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface RealLlmConsentDecisionSimulation {
  id: string;
  timestamp: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmConsentSimulationDecision;
  simulatedDecision: "pending_review_only";
  decisionChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "real-llm-consent-decision-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: RealLlmConsentDecisionSimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
export function listRealLlmConsentDecisionSimulations(limit=100): RealLlmConsentDecisionSimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateRealLlmConsentDecision(input:{ consentRequestId?: string; metadata?: Record<string, unknown> }): RealLlmConsentDecisionSimulation {
  ensureStore();
  const requests=readJsonl(consentPath());
  const req=input.consentRequestId ? requests.find((entry:any)=>entry.id===input.consentRequestId) : requests[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"consent_request_exists", passed:Boolean(req), reason: req ? "Consent Request gefunden." : "Consent Request fehlt." });
  checks.push({ name:"approval_pending", passed: req?.consentScope?.approvalStatus === "pending", reason: req?.consentScope?.approvalStatus === "pending" ? "Approval ist pending." : "Approval ist nicht pending." });
  checks.push({ name:"explicit_human_approval_required", passed: req?.humanApprovalRequired === true && req?.consentScope?.requiresExplicitHumanApproval === true, reason: "Explizite Human Approval muss verpflichtend sein." });
  checks.push({ name:"consent_required", passed: req?.consentRequired === true, reason: req?.consentRequired === true ? "Consent ist verpflichtend." : "Consent fehlt." });
  checks.push({ name:"real_llm_still_blocked", passed: req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason: "Real LLM Call muss vor expliziter Freigabe blockiert bleiben." });
  checks.push({ name:"execution_blocked", passed: req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason: "Execution-, Tool- und Agent-Ausführung müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: req?.dryRunOnly === true, reason: req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"no_secret_risk", passed: req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview), reason: req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  let decision: RealLlmConsentSimulationDecision="consent_decision_simulated_pending";
  let reason="Consent Decision Simulation hält den Request im Pending Review. Kein produktiver LLM-Aufruf.";
  if(!req){ decision="blocked_missing_consent_request"; reason="Consent Request nicht gefunden."; }
  else if(req.consentScope?.approvalStatus !== "pending"){ decision="blocked_not_pending"; reason="Consent Request ist nicht pending."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist vor expliziter Approval nicht eindeutig blockiert."; }
  else if(req.humanApprovalRequired !== true || req.consentScope?.requiresExplicitHumanApproval !== true){ decision="blocked_missing_human_approval_requirement"; reason="Explizite Human Approval fehlt."; }
  else if(req.noSecretsIncluded !== true || containsSecretPattern(req.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Consent Decision erkannt."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Consent Request verletzt Execution Safety Invariants."; }
  const sim: RealLlmConsentDecisionSimulation={
    id:makeId("real-llm-consent-decision-sim"),
    timestamp:new Date().toISOString(),
    consentRequestId:req?.id || input.consentRequestId,
    gateId:req?.gateId,
    responseId:req?.responseId,
    envelopeId:req?.envelopeId,
    recommendationId:req?.recommendationId,
    actionType:req?.actionType,
    decision,
    simulatedDecision:"pending_review_only",
    decisionChecks:checks,
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
    metadata:{ ...(input.metadata||{}), phase:"20.1", noExecution:true, noRealLlmCall:true, pendingReviewOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.consentRequestId,
    status:sim.decision,
    riskLevel:"high",
    summary:"Real LLM Consent Decision Simulation: "+sim.decision,
    metadata:{ source:"phase20.1-real-llm-consent-decision", simulationId:sim.id, consentRequestId:sim.consentRequestId, realLlmCallAllowed:false, llmCallPerformed:false, humanApprovalRequired:true },
  });
  return sim;
}
export function summarizeRealLlmConsentDecisionSimulations(sims:RealLlmConsentDecisionSimulation[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; if(sim.actionType) byActionType[sim.actionType]=(byActionType[sim.actionType]||0)+1; } return { total:sims.length, byDecision, byActionType }; }
`;
const api = String.raw`import { listRealLlmConsentDecisionSimulations, simulateRealLlmConsentDecision, summarizeRealLlmConsentDecisionSimulations } from "../../../lib/real-llm-consent-decision-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listRealLlmConsentDecisionSimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeRealLlmConsentDecisionSimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Consent Decision Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateRealLlmConsentDecision({ consentRequestId: typeof body.consentRequestId==="string" ? body.consentRequestId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Consent Decision Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Consent={id:string;decision:string;actionType?:string;timestamp:string;consentScope?:{approvalStatus:string}};
type Sim={id:string;timestamp:string;decision:string;actionType?:string;reason:string;simulatedDecision:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;consentRequired:boolean;humanApprovalRequired:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;decisionChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function RealLlmConsentDecisionPage(){
 const [requests,setRequests]=useState<Consent[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,sRes]=await Promise.all([fetch("/api/real-llm-consent?limit=100",{cache:"no-store"}),fetch("/api/real-llm-consent-decision?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const s=await sRes.json(); if(cRes.ok){ const list=Array.isArray(c.consentRequests)?c.consentRequests:[]; setRequests(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Consent Decision Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/real-llm-consent-decision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consentRequestId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="real-llm-consent-decision" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Real LLM Consent Decision</h1><p style={{lineHeight:1.6}}>Phase 20.1 simuliert die Consent-Entscheidung als Pending Review und schreibt Audit Events. Kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Decision Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{requests.map((req)=><option key={req.id} value={req.id}>{req.actionType || "real-llm-consent"} · {req.decision} · {req.consentScope?.approvalStatus || "pending"} · {req.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Consent Decision simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Decision Simulations</h2>{sims.length===0 ? <p>Noch keine Decision Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.actionType || "real-llm-consent-decision"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Simulated decision:</strong> {sim.simulatedDecision}</p><p><strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>Consent:</strong> {String(sim.consentRequired)} · <strong>Human approval:</strong> {String(sim.humanApprovalRequired)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Execution:</strong> {String(sim.executionAllowed)} · <strong>Tool:</strong> {String(sim.toolExecutionAllowed)} · <strong>Agent:</strong> {String(sim.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.decisionChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "real-llm-consent-decision"')){ const marker='{ href: "/real-llm-consent", label: "Real LLM Consent", key: "real-llm-consent" },'; const line='  { href: "/real-llm-consent-decision", label: "Consent Decision", key: "real-llm-consent-decision" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Consent Decision Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Consent Decision bereits vorhanden."); }
function patchDocs(){ ensureFile("phase20-1-consent-decision-simulation-audit.md", `# Phase 20.1 – Consent Decision Simulation & Audit

## Ziel
Real LLM Consent Requests werden als Decision Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /real-llm-consent-decision
- API: /api/real-llm-consent-decision
- Store: data/real-llm-consent-decision-simulations.jsonl

## Sicherheitsprinzip
- keine echte Freigabe
- simulatedDecision=pending_review_only
- realLlmCallAllowed=false
- llmCallPerformed=false
- consentRequired=true
- humanApprovalRequired=true
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 20.2 kann Real LLM Consent Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase20-consent-decision-simulation-audit-runbook.md", `# Runbook – Phase 20.1 Consent Decision Simulation & Audit

## Patch
\`\`\`powershell
npm run phase20:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase20-1-patch-real-llm-consent-decision-simulation-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase20:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/real-llm-consent-decision-store.ts", store);
ensureFile("frontend/app/api/real-llm-consent-decision/route.ts", api);
ensureFile("frontend/app/real-llm-consent-decision/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 20.1 Patch abgeschlossen.");
