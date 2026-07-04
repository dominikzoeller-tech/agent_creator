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
  pkg.scripts["phase28:0:patch"]="node scripts/phase28-0-patch-approval-token-issuance-gate.cjs";
  pkg.scripts["phase28:0:verify"]="node scripts/phase28-0-verify-approval-token-issuance-gate.cjs";
  pkg.scripts["llm:approval-token-issuance-gate:verify"]="node scripts/phase28-0-verify-approval-token-issuance-gate.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 28.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenIssuanceGateDecision =
  | "approval_token_issuance_gate_prepared_no_provider_call"
  | "blocked_missing_approval_token_request"
  | "blocked_approval_token_not_requested"
  | "blocked_approval_token_already_issued"
  | "blocked_missing_explicit_issuance_intent"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_token"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenIssuanceGate {
  id: string;
  timestamp: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenIssuanceGateDecision;
  issuanceGateMode: "explicit_human_approval_token_issuance_gate_no_provider_call";
  issuanceChecks: Array<{ name: string; passed: boolean; reason: string }>;
  issuanceState: {
    approvalTokenRequested: true;
    approvalTokenIssuancePrepared: true;
    approvalTokenIssued: false;
    humanApproved: false;
    humanApprovalRequired: true;
    issuanceIntentRecorded: boolean;
    issuanceReason: string;
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
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function issuanceGatePath(): string { return path.join(dataDir(), "approval-token-issuance-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendIssuanceGate(gate: ApprovalTokenIssuanceGate): void { ensureStore(); appendFileSync(issuanceGatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenIssuanceGates(limit=100): ApprovalTokenIssuanceGate[] { ensureStore(); return readJsonl(issuanceGatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createApprovalTokenIssuanceGate(input:{ approvalTokenRequestId?: string; issuanceReason?: string; issuanceIntent?: boolean; metadata?: Record<string, unknown> }): ApprovalTokenIssuanceGate {
  ensureStore();
  const requests=readJsonl(requestPath());
  const req=input.approvalTokenRequestId ? requests.find((entry:any)=>entry.id===input.approvalTokenRequestId) : requests[0];
  const approval=req?.approvalRequest || {};
  const plan=req?.providerCallPlan || {};
  const controls=req?.operationalControls || {};
  const issuanceIntentRecorded=input.issuanceIntent === true;
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"approval_token_request_exists", passed:Boolean(req), reason: req ? "Approval Token Request gefunden." : "Approval Token Request fehlt." });
  checks.push({ name:"approval_token_requested", passed:approval.approvalTokenRequested === true, reason:"Approval Token muss explizit requested sein." });
  checks.push({ name:"approval_token_not_already_issued", passed:approval.approvalTokenIssued === false, reason:"Token darf nicht bereits ausgestellt sein." });
  checks.push({ name:"human_not_implicitly_approved", passed:approval.humanApproved === false, reason:"Gate erteilt keine implizite Human Approval." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval bleibt erforderlich." });
  checks.push({ name:"issuance_intent_recorded", passed:issuanceIntentRecorded, reason:"Explizite Token-Issuance-Intent muss separat erfasst werden." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:req?.noSecretsIncluded === true && !containsSecretValue(req), reason:"Issuance Gate darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  checks.push({ name:"real_llm_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Token blockiert." });
  checks.push({ name:"network_provider_blocked", passed:req?.networkCallPerformed === false && req?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenIssuanceGateDecision="approval_token_issuance_gate_prepared_no_provider_call";
  let reason="Approval Token Issuance Gate vorbereitet. Token wird weiterhin nicht automatisch ausgestellt. Kein Provider-/Netzwerk-Aufruf.";
  if(!req){ decision="blocked_missing_approval_token_request"; reason="Approval Token Request nicht gefunden."; }
  else if(approval.approvalTokenRequested !== true){ decision="blocked_approval_token_not_requested"; reason="Approval Token wurde nicht requested."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(!issuanceIntentRecorded){ decision="blocked_missing_explicit_issuance_intent"; reason="Explizite Issuance Intent fehlt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || req.networkCallPerformed !== false || req.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(req.noSecretsIncluded !== true || containsSecretValue(req)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_token"; reason="Real LLM Call ist ohne Token nicht blockiert."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const gate:ApprovalTokenIssuanceGate={
    id:makeId("approval-token-issuance-gate"),
    timestamp:new Date().toISOString(),
    approvalTokenRequestId:req?.id || input.approvalTokenRequestId,
    gateId:req?.gateId,
    simulationEnvelopeId:req?.simulationEnvelopeId,
    preflightId:req?.preflightId,
    boundaryCheckId:req?.boundaryCheckId,
    adapterStubId:req?.adapterStubId,
    invocationEnvelopeId:req?.invocationEnvelopeId,
    decision,
    issuanceGateMode:"explicit_human_approval_token_issuance_gate_no_provider_call",
    issuanceChecks:checks,
    issuanceState:{ approvalTokenRequested:true, approvalTokenIssuancePrepared:true, approvalTokenIssued:false, humanApproved:false, humanApprovalRequired:true, issuanceIntentRecorded, issuanceReason:input.issuanceReason || "Token issuance gate prepared. Token not issued automatically." },
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
    metadata:{ ...(input.metadata||{}), phase:"28.0", approvalTokenIssuancePrepared:true, approvalTokenIssued:false, humanApproved:false, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendIssuanceGate(gate);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:gate.id,
    status:gate.decision,
    riskLevel:"critical",
    summary:"Approval Token Issuance Gate: "+gate.decision,
    metadata:{ source:"phase28.0-approval-token-issuance-gate", issuanceGateId:gate.id, approvalTokenRequestId:gate.approvalTokenRequestId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return gate;
}
export function summarizeApprovalTokenIssuanceGates(gates:ApprovalTokenIssuanceGate[]){ const byDecision:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; } return { total:gates.length, byDecision }; }
`;
const api=String.raw`import { createApprovalTokenIssuanceGate, listApprovalTokenIssuanceGates, summarizeApprovalTokenIssuanceGates } from "../../../lib/approval-token-issuance-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const approvalTokenIssuanceGates=listApprovalTokenIssuanceGates(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenIssuanceGates(approvalTokenIssuanceGates), approvalTokenIssuanceGates }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Gates konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const approvalTokenIssuanceGate=createApprovalTokenIssuanceGate({ approvalTokenRequestId: typeof body.approvalTokenRequestId==="string" ? body.approvalTokenRequestId : undefined, issuanceReason: typeof body.issuanceReason==="string" ? body.issuanceReason : undefined, issuanceIntent: body.issuanceIntent === true, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, approvalTokenIssuanceGate }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Gate konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Req={id:string;decision:string;timestamp:string;requestMode:string};
type Gate={id:string;timestamp:string;decision:string;reason:string;issuanceGateMode:string;issuanceState:any;providerCallPlan:any;operationalControls:any;issuanceChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ApprovalTokenIssuanceGatePage(){
 const [requests,setRequests]=useState<Req[]>([]); const [gates,setGates]=useState<Gate[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [issuanceReason,setIssuanceReason]=useState("Token issuance gate prepared. Token not issued automatically."); const [issuanceIntent,setIssuanceIntent]=useState(false); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,gRes]=await Promise.all([fetch("/api/human-approval-token-request?limit=100",{cache:"no-store"}),fetch("/api/approval-token-issuance-gate?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const g=await gRes.json(); if(rRes.ok){ const list=Array.isArray(r.approvalTokenRequests)?r.approvalTokenRequests:[]; setRequests(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!gRes.ok) throw new Error(g?.error||"Issuance Gates konnten nicht geladen werden."); setGates(Array.isArray(g.approvalTokenIssuanceGates)?g.approvalTokenIssuanceGates:[]); setSummary(g.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createGate(){ const res=await fetch("/api/approval-token-issuance-gate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({approvalTokenRequestId:selected,issuanceReason,issuanceIntent})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Issuance Gate fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approval-token-issuance-gate" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Approval Token Issuance Gate</h1><p style={{lineHeight:1.6}}>Phase 28.0 bereitet ein separates Approval Token Issuance Gate vor. Token-Ausstellung bleibt kontrolliert und auditierbar. Kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Issuance Gate vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{requests.map((req)=><option key={req.id} value={req.id}>{req.requestMode} · {req.decision} · {req.id}</option>)}</select><label>Issuance Reason</label><textarea className="text-input" value={issuanceReason} onChange={(ev)=>setIssuanceReason(ev.target.value)} rows={3} /><label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={issuanceIntent} onChange={(ev)=>setIssuanceIntent(ev.target.checked)} /> Explicit issuance intent recorded</label><button className="primary-button" type="button" onClick={createGate} disabled={!selected}>Approval Token Issuance Gate vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Issuance Gates</h2>{gates.length===0 ? <p>Noch keine Issuance Gates.</p> : gates.map((gate)=><article key={gate.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{gate.issuanceGateMode}</strong> <span className="chip">{gate.decision}</span></div><div className="helper-text"><code>{gate.id}</code> · {gate.timestamp}</div><p><strong>Reason:</strong> {gate.reason}</p><p><strong>No secrets:</strong> {String(gate.noSecretsIncluded)} · <strong>Network call:</strong> {String(gate.networkCallPerformed)} · <strong>Provider execution:</strong> {String(gate.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(gate.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(gate.llmCallPerformed)} · <strong>Dry-run:</strong> {String(gate.dryRunOnly)}</p><h3>Issuance State</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gate.issuanceState ?? {}, null, 2)}</pre><h3>Provider Call Plan</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gate.providerCallPlan ?? {}, null, 2)}</pre><ul>{gate.issuanceChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approval-token-issuance-gate"')){ const line='  { href: "/approval-token-issuance-gate", label: "Token Issuance Gate", key: "approval-token-issuance-gate" },'; const markers=['{ href: "/approval-token-request-dashboard", label: "Approval Token Dashboard", key: "approval-token-request-dashboard" },','{ href: "/approval-token-request-policy", label: "Approval Token Policy", key: "approval-token-request-policy" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Issuance Gate Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Issuance Gate bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase28-0-approval-token-issuance-gate.md", `# Phase 28.0 – Explicit Human Approval Token Issuance Gate / Still No Provider Call

## Ziel
Ein separates Approval Token Issuance Gate wird vorbereitet. Token-Ausstellung bleibt kontrolliert und auditierbar. Es findet kein Provider-/Netzwerk-Aufruf statt.

## Neue UI/API
- UI: /approval-token-issuance-gate
- API: /api/approval-token-issuance-gate
- Store: data/approval-token-issuance-gates.jsonl

## Sicherheitsprinzip
- explicit_human_approval_token_issuance_gate_no_provider_call
- Approval Token Request als Input
- Token-Ausstellung separat kontrollieren
- approvalTokenIssuancePrepared=true
- approvalTokenIssued=false
- humanApproved=false
- issuanceIntentRecorded muss explizit sein
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 28.1 kann Approval Token Issuance Policy & Audit ergänzen.
`);
ensureFile("docs/phase28-approval-token-issuance-gate-runbook.md", `# Runbook – Phase 28.0 Approval Token Issuance Gate

## Patch
\`\`\`powershell
npm run phase28:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase28-0-patch-approval-token-issuance-gate.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase28:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/approval-token-issuance-gate-store.ts", store);
ensureFile("frontend/app/api/approval-token-issuance-gate/route.ts", api);
ensureFile("frontend/app/approval-token-issuance-gate/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 28.0 Patch abgeschlossen.");
