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
  pkg.scripts["phase20:0:patch"]="node scripts/phase20-0-patch-real-llm-invocation-consent-gate.cjs";
  pkg.scripts["phase20:0:verify"]="node scripts/phase20-0-verify-real-llm-invocation-consent-gate.cjs";
  pkg.scripts["llm:real-consent:verify"]="node scripts/phase20-0-verify-real-llm-invocation-consent-gate.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 20.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealLlmConsentDecision =
  | "consent_request_prepared"
  | "blocked_missing_real_llm_gate"
  | "blocked_policy_gate_missing"
  | "blocked_real_llm_allowed_without_consent"
  | "blocked_secret_risk"
  | "blocked_execution_not_safe";

export interface RealLlmInvocationConsentRequest {
  id: string;
  timestamp: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmConsentDecision;
  consentScope: {
    purpose: "real_llm_invocation";
    requiresExplicitHumanApproval: true;
    approvalStatus: "pending";
    canExpire: true;
    expiresAt: string;
  };
  consentChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "real-llm-invocation-consent-requests.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendConsent(req: RealLlmInvocationConsentRequest): void { ensureStore(); appendFileSync(consentPath(), JSON.stringify(req)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitizedPreview(gate:any): string { return String(gate?.sanitizedPromptPreview || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1800); }
function expiresAt(): string { return new Date(Date.now() + 30 * 60 * 1000).toISOString(); }
export function listRealLlmInvocationConsentRequests(limit=100): RealLlmInvocationConsentRequest[] { ensureStore(); return readJsonl(consentPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createRealLlmInvocationConsentRequest(input:{ gateId?: string; metadata?: Record<string, unknown> }): RealLlmInvocationConsentRequest {
  ensureStore();
  const gates=readJsonl(gatesPath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"real_llm_gate_exists", passed:Boolean(gate), reason: gate ? "Real LLM Call Gate gefunden." : "Real LLM Call Gate fehlt." });
  checks.push({ name:"policy_gate_required", passed: gate?.policyGateRequired === true && gate?.invocationPlan?.policyGateRequired === true, reason: "Policy Gate muss vor Consent vorhanden sein." });
  checks.push({ name:"real_llm_not_yet_allowed", passed: gate?.realLlmCallAllowed === false, reason: gate?.realLlmCallAllowed === false ? "Real LLM Call ist noch blockiert." : "Real LLM Call wäre bereits erlaubt." });
  checks.push({ name:"llm_call_not_performed", passed: gate?.llmCallPerformed === false, reason: gate?.llmCallPerformed === false ? "Kein LLM-Aufruf erfolgt." : "LLM-Aufruf wurde bereits durchgeführt." });
  checks.push({ name:"execution_blocked", passed: gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason: "Tool-, Agent- und Execution-Freigaben müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan_before_consent", passed: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview), reason: gate?.noSecretsIncluded === true && !containsSecretPattern(gate?.sanitizedPromptPreview) ? "Kein Secret-Risiko vor Consent." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_before_consent", passed:true, reason:"Output Contract wird vor Consent fixiert." });
  let decision: RealLlmConsentDecision="consent_request_prepared";
  let reason="Real LLM Invocation Consent Request vorbereitet. Kein produktiver LLM-Aufruf, Approval pending.";
  if(!gate){ decision="blocked_missing_real_llm_gate"; reason="Real LLM Call Gate nicht gefunden."; }
  else if(gate.policyGateRequired !== true || gate.invocationPlan?.policyGateRequired !== true){ decision="blocked_policy_gate_missing"; reason="Policy Gate fehlt vor Consent."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_consent"; reason="Real LLM Call ist nicht eindeutig vor Consent blockiert."; }
  else if(gate.noSecretsIncluded !== true || containsSecretPattern(gate.sanitizedPromptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Consent erkannt."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Gate verletzt Execution Safety Invariants."; }
  const req: RealLlmInvocationConsentRequest={
    id:makeId("real-llm-consent"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    responseId:gate?.responseId,
    envelopeId:gate?.envelopeId,
    recommendationId:gate?.recommendationId,
    actionType:gate?.actionType,
    decision,
    consentScope:{ purpose:"real_llm_invocation", requiresExplicitHumanApproval:true, approvalStatus:"pending", canExpire:true, expiresAt:expiresAt() },
    consentChecks:checks,
    promptPreview: gate ? sanitizedPreview(gate) : "",
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
    metadata:{ ...(input.metadata||{}), phase:"20.0", noExecution:true, noRealLlmCall:true, humanApprovalRequired:true },
  };
  appendConsent(req);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:req.id,
    status:req.decision,
    riskLevel:"high",
    summary:"Real LLM Invocation Consent Request: "+req.decision,
    metadata:{ source:"phase20.0-real-llm-invocation-consent", consentRequestId:req.id, gateId:req.gateId, realLlmCallAllowed:false, llmCallPerformed:false, humanApprovalRequired:true },
  });
  return req;
}
export function summarizeRealLlmInvocationConsentRequests(reqs:RealLlmInvocationConsentRequest[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const req of reqs){ byDecision[req.decision]=(byDecision[req.decision]||0)+1; if(req.actionType) byActionType[req.actionType]=(byActionType[req.actionType]||0)+1; } return { total:reqs.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createRealLlmInvocationConsentRequest, listRealLlmInvocationConsentRequests, summarizeRealLlmInvocationConsentRequests } from "../../../lib/real-llm-invocation-consent-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const consentRequests=listRealLlmInvocationConsentRequests(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeRealLlmInvocationConsentRequests(consentRequests), consentRequests });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Consent Requests konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const consentRequest=createRealLlmInvocationConsentRequest({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, consentRequest });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Consent Request konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;actionType?:string;timestamp:string};
type Consent={id:string;timestamp:string;decision:string;actionType?:string;reason:string;promptPreview:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;consentRequired:boolean;humanApprovalRequired:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;consentChecks:Array<{name:string;passed:boolean;reason:string}>;consentScope:{approvalStatus:string;expiresAt:string}};
export default function RealLlmInvocationConsentPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [requests,setRequests]=useState<Consent[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,cRes]=await Promise.all([fetch("/api/real-llm-call-gate?limit=100",{cache:"no-store"}),fetch("/api/real-llm-consent?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const c=await cRes.json(); if(gRes.ok){ const list=Array.isArray(g.gates)?g.gates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!cRes.ok) throw new Error(c?.error||"Real LLM Consent Requests konnten nicht geladen werden."); setRequests(Array.isArray(c.consentRequests)?c.consentRequests:[]); setSummary(c.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createConsent(){ const res=await fetch("/api/real-llm-consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Consent Request fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="real-llm-consent" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Real LLM Invocation Consent</h1><p style={{lineHeight:1.6}}>Phase 20.0 bereitet ein ausdrückliches Human-Approval-Gate für spätere echte LLM-Aufrufe vor. Kein produktiver LLM-Aufruf ohne explizite Freigabe.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Consent Request vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.actionType || "real-llm-gate"} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={createConsent} disabled={!selected}>Real LLM Consent Request vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Consent Requests</h2>{requests.length===0 ? <p>Noch keine Consent Requests.</p> : requests.map((req)=><article key={req.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{req.actionType || "real-llm-consent"}</strong> <span className="chip">{req.decision}</span></div><div className="helper-text"><code>{req.id}</code> · {req.timestamp}</div><p><strong>Reason:</strong> {req.reason}</p><p><strong>Approval:</strong> {req.consentScope?.approvalStatus} · <strong>Expires:</strong> {req.consentScope?.expiresAt}</p><p><strong>Real LLM allowed:</strong> {String(req.realLlmCallAllowed)} · <strong>Consent:</strong> {String(req.consentRequired)} · <strong>Human approval:</strong> {String(req.humanApprovalRequired)} · <strong>LLM Call:</strong> {String(req.llmCallPerformed)} · <strong>Execution:</strong> {String(req.executionAllowed)} · <strong>Tool:</strong> {String(req.toolExecutionAllowed)} · <strong>Agent:</strong> {String(req.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(req.dryRunOnly)}</p><h3>Consent Checks</h3><ul>{req.consentChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul><h3>Prompt Preview</h3><pre style={{whiteSpace:"pre-wrap"}}>{req.promptPreview}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "real-llm-consent"')){ const marker='{ href: "/real-llm-gate-dashboard", label: "Real LLM Dashboard", key: "real-llm-gate-dashboard" },'; const line='  { href: "/real-llm-consent", label: "Real LLM Consent", key: "real-llm-consent" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real LLM Consent Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real LLM Consent bereits vorhanden."); }
function patchDocs(){ ensureFile("phase20-0-real-llm-invocation-consent-gate.md", `# Phase 20.0 – Real LLM Invocation Consent Gate / Explicit Human Approval Prep

## Ziel
Vor einem späteren echten LLM-Aufruf wird ein ausdrückliches Human-Approval-/Consent-Gate vorbereitet.

## Neue UI/API
- UI: /real-llm-consent
- API: /api/real-llm-consent
- Store: data/real-llm-invocation-consent-requests.jsonl

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf ohne explizite Nutzerfreigabe
- consentRequired=true
- humanApprovalRequired=true
- approvalStatus=pending
- realLlmCallAllowed=false
- llmCallPerformed=false
- Secret Scan vor Consent
- Output Contract vor Consent
- Audit vor/nach Consent-Entscheidung
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 20.1 kann Consent Decision Simulation & Audit ergänzen.
`);
ensureFile("docs/phase20-real-llm-invocation-consent-gate-runbook.md", `# Runbook – Phase 20.0 Real LLM Invocation Consent Gate

## Patch
\`\`\`powershell
npm run phase20:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase20-0-patch-real-llm-invocation-consent-gate.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase20:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/real-llm-invocation-consent-store.ts", store);
ensureFile("frontend/app/api/real-llm-consent/route.ts", api);
ensureFile("frontend/app/real-llm-consent/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 20.0 Patch abgeschlossen.");
