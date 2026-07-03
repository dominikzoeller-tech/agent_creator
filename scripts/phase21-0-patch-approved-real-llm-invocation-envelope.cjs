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
  pkg.scripts["phase21:0:patch"]="node scripts/phase21-0-patch-approved-real-llm-invocation-envelope.cjs";
  pkg.scripts["phase21:0:verify"]="node scripts/phase21-0-verify-approved-real-llm-invocation-envelope.cjs";
  pkg.scripts["llm:approved-envelope:verify"]="node scripts/phase21-0-verify-approved-real-llm-invocation-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 21.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovedInvocationEnvelopeDecision =
  | "invocation_envelope_prepared"
  | "blocked_missing_consent_request"
  | "blocked_consent_not_pending_or_approved"
  | "blocked_consent_expired"
  | "blocked_missing_human_approval_requirement"
  | "blocked_real_llm_call_already_allowed"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface ApprovedRealLlmInvocationEnvelope {
  id: string;
  timestamp: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ApprovedInvocationEnvelopeDecision;
  approvalState: {
    approvalStatus: "pending" | "approved" | "unknown";
    acceptedForEnvelopePrep: boolean;
    expiresAt?: string;
    notExpired: boolean;
  };
  envelopeChecks: Array<{ name: string; passed: boolean; reason: string }>;
  invocationEnvelope: {
    mode: "approved_invocation_envelope_prep_only";
    realLlmCallAllowed: false;
    llmCallPerformed: false;
    providerExecutionAllowed: false;
    toolExecutionAllowed: false;
    agentExecutionAllowed: false;
    outputContractLocked: true;
    auditBeforeInvocationRequired: true;
    finalSecretScanRequired: true;
  };
  promptPreview: string;
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  consentRequired: true;
  humanApprovalRequired: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(env: ApprovedRealLlmInvocationEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(env)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitize(value: unknown): string { return String(value || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 2000); }
function isNotExpired(value: unknown): boolean { if(typeof value !== "string" || !value) return false; const t=Date.parse(value); return Number.isFinite(t) && t > Date.now(); }
function approvalStatus(req:any): "pending" | "approved" | "unknown" { const s=req?.consentScope?.approvalStatus; return s === "approved" || s === "pending" ? s : "unknown"; }
export function listApprovedRealLlmInvocationEnvelopes(limit=100): ApprovedRealLlmInvocationEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createApprovedRealLlmInvocationEnvelope(input:{ consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedRealLlmInvocationEnvelope {
  ensureStore();
  const requests=readJsonl(consentPath());
  const req=input.consentRequestId ? requests.find((entry:any)=>entry.id===input.consentRequestId) : requests[0];
  const status=approvalStatus(req);
  const notExpired=isNotExpired(req?.consentScope?.expiresAt);
  const acceptedForEnvelopePrep=status === "pending" || status === "approved";
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"consent_request_exists", passed:Boolean(req), reason: req ? "Consent Request gefunden." : "Consent Request fehlt." });
  checks.push({ name:"approval_state_valid_for_prep", passed:acceptedForEnvelopePrep, reason:"Für Envelope-Prep sind pending oder approved erlaubt; echte Invocation bleibt blockiert." });
  checks.push({ name:"consent_not_expired", passed:notExpired, reason:notExpired ? "Consent Request ist nicht abgelaufen." : "Consent Request ist abgelaufen oder Ablaufzeit fehlt." });
  checks.push({ name:"human_approval_required", passed:req?.humanApprovalRequired === true && req?.consentScope?.requiresExplicitHumanApproval === true, reason:"Explizite Human Approval muss weiterhin verpflichtend sein." });
  checks.push({ name:"real_llm_still_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt im Envelope blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Tool-, Agent- und Execution-Freigaben bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"final_secret_scan", passed:req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview), reason:req?.noSecretsIncluded === true && !containsSecretPattern(req?.promptPreview) ? "Finaler Secret Scan ohne Treffer." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_locked", passed:req?.outputContract?.outputType === "recommendation_explanation_only" && req?.outputContract?.mayExecuteTools === false && req?.outputContract?.mayExecuteAgents === false && req?.outputContract?.mayRevealSecrets === false && req?.outputContract?.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend sein." });
  let decision: ApprovedInvocationEnvelopeDecision="invocation_envelope_prepared";
  let reason="Approved Real LLM Invocation Envelope vorbereitet. Keine Tool-/Agent-Ausführung und kein produktiver LLM-Aufruf.";
  if(!req){ decision="blocked_missing_consent_request"; reason="Consent Request nicht gefunden."; }
  else if(!acceptedForEnvelopePrep){ decision="blocked_consent_not_pending_or_approved"; reason="Consent Status ist nicht für Envelope Prep geeignet."; }
  else if(!notExpired){ decision="blocked_consent_expired"; reason="Consent Request ist abgelaufen."; }
  else if(req.humanApprovalRequired !== true || req.consentScope?.requiresExplicitHumanApproval !== true){ decision="blocked_missing_human_approval_requirement"; reason="Human Approval Requirement fehlt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_call_already_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(req.noSecretsIncluded !== true || containsSecretPattern(req.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Consent Prompt Preview erkannt."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Consent Request verletzt Execution Safety Invariants."; }
  const out=req?.outputContract || {};
  const env: ApprovedRealLlmInvocationEnvelope={
    id:makeId("approved-real-llm-envelope"),
    timestamp:new Date().toISOString(),
    consentRequestId:req?.id || input.consentRequestId,
    gateId:req?.gateId,
    responseId:req?.responseId,
    envelopeId:req?.envelopeId,
    recommendationId:req?.recommendationId,
    actionType:req?.actionType,
    decision,
    approvalState:{ approvalStatus:status, acceptedForEnvelopePrep, expiresAt:req?.consentScope?.expiresAt, notExpired },
    envelopeChecks:checks,
    invocationEnvelope:{ mode:"approved_invocation_envelope_prep_only", realLlmCallAllowed:false, llmCallPerformed:false, providerExecutionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, outputContractLocked:true, auditBeforeInvocationRequired:true, finalSecretScanRequired:true },
    promptPreview:req ? sanitize(req.promptPreview) : "",
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"21.0", noExecution:true, noRealLlmCall:true, envelopePrepOnly:true },
  };
  appendEnvelope(env);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:env.id,
    status:env.decision,
    riskLevel:"high",
    summary:"Approved Real LLM Invocation Envelope: "+env.decision,
    metadata:{ source:"phase21.0-approved-real-llm-invocation-envelope", envelopeId:env.id, consentRequestId:env.consentRequestId, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false },
  });
  return env;
}
export function summarizeApprovedRealLlmInvocationEnvelopes(envs:ApprovedRealLlmInvocationEnvelope[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const env of envs){ byDecision[env.decision]=(byDecision[env.decision]||0)+1; if(env.actionType) byActionType[env.actionType]=(byActionType[env.actionType]||0)+1; } return { total:envs.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createApprovedRealLlmInvocationEnvelope, listApprovedRealLlmInvocationEnvelopes, summarizeApprovedRealLlmInvocationEnvelopes } from "../../../lib/approved-real-llm-invocation-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const invocationEnvelopes=listApprovedRealLlmInvocationEnvelopes(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeApprovedRealLlmInvocationEnvelopes(invocationEnvelopes), invocationEnvelopes });
  } catch(error){
    const message=error instanceof Error ? error.message : "Approved Invocation Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const invocationEnvelope=createApprovedRealLlmInvocationEnvelope({ consentRequestId: typeof body.consentRequestId==="string" ? body.consentRequestId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, invocationEnvelope });
  } catch(error){
    const message=error instanceof Error ? error.message : "Approved Invocation Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Consent={id:string;decision:string;actionType?:string;timestamp:string;consentScope?:{approvalStatus:string;expiresAt:string}};
type Env={id:string;timestamp:string;decision:string;actionType?:string;reason:string;promptPreview:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;consentRequired:boolean;humanApprovalRequired:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;approvalState:any;envelopeChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function ApprovedRealLlmInvocationEnvelopePage(){
 const [requests,setRequests]=useState<Consent[]>([]); const [envelopes,setEnvelopes]=useState<Env[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,eRes]=await Promise.all([fetch("/api/real-llm-consent?limit=100",{cache:"no-store"}),fetch("/api/approved-real-llm-invocation-envelope?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const e=await eRes.json(); if(cRes.ok){ const list=Array.isArray(c.consentRequests)?c.consentRequests:[]; setRequests(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!eRes.ok) throw new Error(e?.error||"Invocation Envelopes konnten nicht geladen werden."); setEnvelopes(Array.isArray(e.invocationEnvelopes)?e.invocationEnvelopes:[]); setSummary(e.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/approved-real-llm-invocation-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consentRequestId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approved-real-llm-invocation-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Approved Real LLM Invocation Envelope</h1><p style={{lineHeight:1.6}}>Phase 21.0 bereitet einen genehmigungsfähigen Invocation Envelope vor. Keine Tool- oder Agent-Ausführung und kein produktiver LLM-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Invocation Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{requests.map((req)=><option key={req.id} value={req.id}>{req.actionType || "real-llm-consent"} · {req.decision} · {req.consentScope?.approvalStatus || "unknown"} · {req.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Approved Invocation Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Invocation Envelopes</h2>{envelopes.length===0 ? <p>Noch keine Invocation Envelopes.</p> : envelopes.map((env)=><article key={env.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{env.actionType || "approved-invocation-envelope"}</strong> <span className="chip">{env.decision}</span></div><div className="helper-text"><code>{env.id}</code> · {env.timestamp}</div><p><strong>Reason:</strong> {env.reason}</p><p><strong>Approval:</strong> {env.approvalState?.approvalStatus} · <strong>Not expired:</strong> {String(env.approvalState?.notExpired)} · <strong>Accepted for prep:</strong> {String(env.approvalState?.acceptedForEnvelopePrep)}</p><p><strong>Real LLM allowed:</strong> {String(env.realLlmCallAllowed)} · <strong>Consent:</strong> {String(env.consentRequired)} · <strong>Human approval:</strong> {String(env.humanApprovalRequired)} · <strong>LLM Call:</strong> {String(env.llmCallPerformed)} · <strong>Execution:</strong> {String(env.executionAllowed)} · <strong>Tool:</strong> {String(env.toolExecutionAllowed)} · <strong>Agent:</strong> {String(env.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(env.dryRunOnly)}</p><h3>Envelope Checks</h3><ul>{env.envelopeChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul><h3>Prompt Preview</h3><pre style={{whiteSpace:"pre-wrap"}}>{env.promptPreview}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approved-real-llm-invocation-envelope"')){ const marker='{ href: "/real-llm-consent-dashboard", label: "Consent Dashboard", key: "real-llm-consent-dashboard" },'; const line='  { href: "/approved-real-llm-invocation-envelope", label: "Invocation Envelope", key: "approved-real-llm-invocation-envelope" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Invocation Envelope Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Invocation Envelope bereits vorhanden."); }
function patchDocs(){ ensureFile("phase21-0-approved-real-llm-invocation-envelope.md", `# Phase 21.0 – Approved Real LLM Invocation Envelope / Still-No-Tool-Execution Prep

## Ziel
Nach Consent wird ein genehmigungsfähiger Invocation Envelope vorbereitet. Es findet weiterhin keine Tool- oder Agent-Ausführung und kein produktiver LLM-Aufruf statt.

## Neue UI/API
- UI: /approved-real-llm-invocation-envelope
- API: /api/approved-real-llm-invocation-envelope
- Store: data/approved-real-llm-invocation-envelopes.jsonl

## Sicherheitsprinzip
- Real LLM Invocation nur als Envelope/Prep
- realLlmCallAllowed=false
- llmCallPerformed=false
- consentRequired=true
- humanApprovalRequired=true
- Consent-Status prüfen
- Consent-Ablaufzeit prüfen
- finaler Secret Scan
- Output Contract locked
- Audit vor Invocation Envelope
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 21.1 kann Invocation Envelope Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase21-approved-real-llm-invocation-envelope-runbook.md", `# Runbook – Phase 21.0 Approved Real LLM Invocation Envelope

## Patch
\`\`\`powershell
npm run phase21:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase21-0-patch-approved-real-llm-invocation-envelope.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase21:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase21:0:patch"]="node scripts/phase21-0-patch-approved-real-llm-invocation-envelope.cjs";
  pkg.scripts["phase21:0:verify"]="node scripts/phase21-0-verify-approved-real-llm-invocation-envelope.cjs";
  pkg.scripts["llm:approved-envelope:verify"]="node scripts/phase21-0-verify-approved-real-llm-invocation-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n"); console.log("OK package.json: Phase 21.0 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/approved-real-llm-invocation-envelope-store.ts", store);
ensureFile("frontend/app/api/approved-real-llm-invocation-envelope/route.ts", api);
ensureFile("frontend/app/approved-real-llm-invocation-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 21.0 Patch abgeschlossen.");
