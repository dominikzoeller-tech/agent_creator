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
  pkg.scripts["phase27:0:patch"]="node scripts/phase27-0-patch-human-approval-token-request.cjs";
  pkg.scripts["phase27:0:verify"]="node scripts/phase27-0-verify-human-approval-token-request.cjs";
  pkg.scripts["llm:human-approval-token-request:verify"]="node scripts/phase27-0-verify-human-approval-token-request.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 27.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type HumanApprovalTokenRequestDecision =
  | "approval_token_request_recorded_no_provider_call"
  | "blocked_missing_real_provider_gate"
  | "blocked_human_approval_not_required"
  | "blocked_human_already_approved"
  | "blocked_approval_token_already_issued"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface HumanApprovalTokenRequest {
  id: string;
  timestamp: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: HumanApprovalTokenRequestDecision;
  requestMode: "explicit_human_approval_token_request_no_provider_call";
  requestChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalRequest: {
    humanApprovalRequired: true;
    humanApproved: false;
    approvalTokenRequested: true;
    approvalTokenIssued: false;
    approvalTokenId?: string;
    approvalReason: string;
  };
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
    manualApprovalRequiredBeforeAnyExternalCall: true;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
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
function gatePath(): string { return path.join(dataDir(), "controlled-real-provider-invocation-gates.jsonl"); }
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendRequest(req: HumanApprovalTokenRequest): void { ensureStore(); appendFileSync(requestPath(), JSON.stringify(req)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listHumanApprovalTokenRequests(limit=100): HumanApprovalTokenRequest[] { ensureStore(); return readJsonl(requestPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createHumanApprovalTokenRequest(input:{ gateId?: string; approvalReason?: string; metadata?: Record<string, unknown> }): HumanApprovalTokenRequest {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const approval=gate?.approvalState || {};
  const plan=gate?.providerCallPlan || {};
  const controls=gate?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"real_provider_gate_exists", passed:Boolean(gate), reason: gate ? "Real Provider Gate gefunden." : "Real Provider Gate fehlt." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval muss vor echtem externen Call zwingend erforderlich sein." });
  checks.push({ name:"human_not_approved_yet", passed:approval.humanApproved === false, reason:"Approval Request darf noch keine Approval erteilen." });
  checks.push({ name:"approval_token_not_issued", passed:approval.approvalTokenIssued === false, reason:"Approval Token darf noch nicht automatisch erteilt sein." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Gate und Request dürfen keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:HumanApprovalTokenRequestDecision="approval_token_request_recorded_no_provider_call";
  let reason="Human Approval Token Request erfasst. Approval Token wird nicht automatisch erteilt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_real_provider_gate"; reason="Real Provider Gate nicht gefunden."; }
  else if(approval.humanApprovalRequired !== true){ decision="blocked_human_approval_not_required"; reason="Human Approval ist nicht zwingend erforderlich."; }
  else if(approval.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Gate ist bereits approved."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Automatischer Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne Approval nicht blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const req:HumanApprovalTokenRequest={
    id:makeId("human-approval-token-request"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    simulationEnvelopeId:gate?.simulationEnvelopeId,
    preflightId:gate?.preflightId,
    boundaryCheckId:gate?.boundaryCheckId,
    adapterStubId:gate?.adapterStubId,
    invocationEnvelopeId:gate?.invocationEnvelopeId,
    decision,
    requestMode:"explicit_human_approval_token_request_no_provider_call",
    requestChecks:checks,
    approvalRequest:{ humanApprovalRequired:true, humanApproved:false, approvalTokenRequested:true, approvalTokenIssued:false, approvalReason:input.approvalReason || "Manual approval requested for future real provider invocation. Token not issued automatically." },
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, manualApprovalRequiredBeforeAnyExternalCall:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision !== "blocked_secret_boundary_violation",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"27.0", approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendRequest(req);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:req.id,
    status:req.decision,
    riskLevel:"critical",
    summary:"Human Approval Token Request: "+req.decision,
    metadata:{ source:"phase27.0-human-approval-token-request", requestId:req.id, gateId:req.gateId, approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return req;
}
export function summarizeHumanApprovalTokenRequests(requests:HumanApprovalTokenRequest[]){ const byDecision:Record<string,number>={}; for(const req of requests){ byDecision[req.decision]=(byDecision[req.decision]||0)+1; } return { total:requests.length, byDecision }; }
`;
const api=String.raw`import { createHumanApprovalTokenRequest, listHumanApprovalTokenRequests, summarizeHumanApprovalTokenRequests } from "../../../lib/human-approval-token-request-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const approvalTokenRequests=listHumanApprovalTokenRequests(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeHumanApprovalTokenRequests(approvalTokenRequests), approvalTokenRequests }); }
  catch(error){ const message=error instanceof Error ? error.message : "Human Approval Token Requests konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const approvalTokenRequest=createHumanApprovalTokenRequest({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, approvalReason: typeof body.approvalReason==="string" ? body.approvalReason : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, approvalTokenRequest }); }
  catch(error){ const message=error instanceof Error ? error.message : "Human Approval Token Request konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;gateMode:string};
type Req={id:string;timestamp:string;decision:string;reason:string;requestMode:string;approvalRequest:any;providerCallPlan:any;operationalControls:any;requestChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function HumanApprovalTokenRequestPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [requests,setRequests]=useState<Req[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [approvalReason,setApprovalReason]=useState("Manual approval requested for future real provider invocation. Token not issued automatically."); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,rRes]=await Promise.all([fetch("/api/controlled-real-provider-invocation-gate?limit=100",{cache:"no-store"}),fetch("/api/human-approval-token-request?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const r=await rRes.json(); if(gRes.ok){ const list=Array.isArray(g.gates)?g.gates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!rRes.ok) throw new Error(r?.error||"Approval Token Requests konnten nicht geladen werden."); setRequests(Array.isArray(r.approvalTokenRequests)?r.approvalTokenRequests:[]); setSummary(r.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createRequest(){ const res=await fetch("/api/human-approval-token-request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gateId:selected,approvalReason})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Approval Token Request fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="human-approval-token-request" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Human Approval Token Request</h1><p style={{lineHeight:1.6}}>Phase 27.0 erfasst einen expliziten Human Approval Token Request. Der Approval Token wird nicht automatisch erteilt. Kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Request erfassen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.gateMode} · {gate.decision} · {gate.id}</option>)}</select><label>Approval Reason</label><textarea className="text-input" value={approvalReason} onChange={(ev)=>setApprovalReason(ev.target.value)} rows={3} /><button className="primary-button" type="button" onClick={createRequest} disabled={!selected}>Human Approval Token Request erfassen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Approval Token Requests</h2>{requests.length===0 ? <p>Noch keine Approval Token Requests.</p> : requests.map((req)=><article key={req.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{req.requestMode}</strong> <span className="chip">{req.decision}</span></div><div className="helper-text"><code>{req.id}</code> · {req.timestamp}</div><p><strong>Reason:</strong> {req.reason}</p><p><strong>No secrets:</strong> {String(req.noSecretsIncluded)} · <strong>Network call:</strong> {String(req.networkCallPerformed)} · <strong>Provider execution:</strong> {String(req.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(req.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(req.llmCallPerformed)} · <strong>Dry-run:</strong> {String(req.dryRunOnly)}</p><h3>Approval Request</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(req.approvalRequest ?? {}, null, 2)}</pre><h3>Provider Call Plan</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(req.providerCallPlan ?? {}, null, 2)}</pre><ul>{req.requestChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "human-approval-token-request"')){ const line='  { href: "/human-approval-token-request", label: "Approval Token Request", key: "human-approval-token-request" },'; const markers=['{ href: "/real-provider-gate-dashboard", label: "Real Gate Dashboard", key: "real-provider-gate-dashboard" },','{ href: "/real-provider-gate-policy", label: "Real Gate Policy", key: "real-provider-gate-policy" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Approval Token Request Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Approval Token Request bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase27-0-human-approval-token-request.md", `# Phase 27.0 – Explicit Human Approval Token Request / Still No Provider Call

## Ziel
Ein kontrollierter Human Approval Token Request wird vorbereitet. Der Approval Token wird nicht automatisch erteilt. Es findet kein Provider-/Netzwerk-Aufruf statt.

## Neue UI/API
- UI: /human-approval-token-request
- API: /api/human-approval-token-request
- Store: data/human-approval-token-requests.jsonl

## Sicherheitsprinzip
- explicit_human_approval_token_request_no_provider_call
- Real Provider Gate als Input
- Human Approval Request erfassen
- Approval Token noch nicht automatisch erteilen
- approvalTokenRequested=true
- approvalTokenIssued=false
- humanApproved=false
- humanApprovalRequired=true
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 27.1 kann Approval Token Request Policy & Audit ergänzen.
`);
ensureFile("docs/phase27-human-approval-token-request-runbook.md", `# Runbook – Phase 27.0 Human Approval Token Request

## Patch
\`\`\`powershell
npm run phase27:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase27-0-patch-human-approval-token-request.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase27:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/human-approval-token-request-store.ts", store);
ensureFile("frontend/app/api/human-approval-token-request/route.ts", api);
ensureFile("frontend/app/human-approval-token-request/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 27.0 Patch abgeschlossen.");
