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
  pkg.scripts["phase27:1:patch"]="node scripts/phase27-1-patch-approval-token-request-policy-audit.cjs";
  pkg.scripts["phase27:1:verify"]="node scripts/phase27-1-verify-approval-token-request-policy-audit.cjs";
  pkg.scripts["llm:approval-token-request:policy:verify"]="node scripts/phase27-1-verify-approval-token-request-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 27.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenRequestPolicyDecision =
  | "approval_token_request_policy_allowed_no_token_issued"
  | "blocked_missing_approval_token_request"
  | "blocked_approval_token_not_requested"
  | "blocked_approval_token_issued"
  | "blocked_human_already_approved"
  | "blocked_human_approval_not_required"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenRequestPolicySimulation {
  id: string;
  timestamp: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenRequestPolicyDecision;
  requestMode: "explicit_human_approval_token_request_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssued: false;
  humanApprovalRequired: true;
  humanApproved: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function requestPath(): string { return path.join(dataDir(), "human-approval-token-requests.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-request-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenRequestPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenRequestPolicySimulations(limit=100): ApprovalTokenRequestPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenRequestPolicy(input:{ approvalTokenRequestId?: string; metadata?: Record<string, unknown> }): ApprovalTokenRequestPolicySimulation {
  ensureStore();
  const requests=readJsonl(requestPath());
  const req=input.approvalTokenRequestId ? requests.find((entry:any)=>entry.id===input.approvalTokenRequestId) : requests[0];
  const approval=req?.approvalRequest || {};
  const plan=req?.providerCallPlan || {};
  const controls=req?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"approval_token_request_exists", passed:Boolean(req), reason: req ? "Approval Token Request gefunden." : "Approval Token Request fehlt." });
  checks.push({ name:"request_mode_no_provider_call", passed:req?.requestMode === "explicit_human_approval_token_request_no_provider_call", reason:"Request Mode muss no-provider-call bleiben." });
  checks.push({ name:"approval_token_requested", passed:approval.approvalTokenRequested === true, reason:"Approval Token Request muss explizit erfasst sein." });
  checks.push({ name:"approval_token_not_issued", passed:approval.approvalTokenIssued === false, reason:"Approval Token darf weiterhin nicht automatisch erteilt sein." });
  checks.push({ name:"human_not_approved", passed:approval.humanApproved === false, reason:"Human Approval darf durch Policy Simulation nicht erteilt werden." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval muss weiterhin zwingend erforderlich sein." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf muss blockiert bleiben." });
  checks.push({ name:"secret_boundary", passed:req?.noSecretsIncluded === true && !containsSecretValue(req), reason:"Approval Token Request darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls müssen Metadata-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed:req?.realLlmCallAllowed === false && req?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"network_provider_blocked", passed:req?.networkCallPerformed === false && req?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:req?.executionAllowed === false && req?.toolExecutionAllowed === false && req?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:req?.dryRunOnly === true, reason:req?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenRequestPolicyDecision="approval_token_request_policy_allowed_no_token_issued";
  let reason="Approval Token Request Policy erlaubt nur Request/Audit-Zustand. Token bleibt nicht erteilt. Kein Provider-/Netzwerk-Aufruf.";
  if(!req){ decision="blocked_missing_approval_token_request"; reason="Approval Token Request nicht gefunden."; }
  else if(approval.approvalTokenRequested !== true){ decision="blocked_approval_token_not_requested"; reason="Approval Token wurde nicht explizit requested."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(approval.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Human Approval ist bereits erteilt."; }
  else if(approval.humanApprovalRequired !== true){ decision="blocked_human_approval_not_required"; reason="Human Approval ist nicht zwingend erforderlich."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || req.networkCallPerformed !== false || req.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-Auswahl oder externer Call ist nicht eindeutig blockiert."; }
  else if(req.noSecretsIncluded !== true || containsSecretValue(req)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(req.realLlmCallAllowed !== false || req.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne Approval nicht blockiert."; }
  else if(req.executionAllowed !== false || req.toolExecutionAllowed !== false || req.agentExecutionAllowed !== false || req.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const sim:ApprovalTokenRequestPolicySimulation={
    id:makeId("approval-token-request-policy-sim"),
    timestamp:new Date().toISOString(),
    approvalTokenRequestId:req?.id || input.approvalTokenRequestId,
    gateId:req?.gateId,
    simulationEnvelopeId:req?.simulationEnvelopeId,
    preflightId:req?.preflightId,
    boundaryCheckId:req?.boundaryCheckId,
    adapterStubId:req?.adapterStubId,
    invocationEnvelopeId:req?.invocationEnvelopeId,
    decision,
    requestMode:"explicit_human_approval_token_request_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssued:false,
    humanApprovalRequired:true,
    humanApproved:false,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision !== "blocked_secret_boundary_violation",
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"27.1", approvalTokenRequested:true, approvalTokenIssued:false, humanApproved:false, approvalRequestPolicyOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.approvalTokenRequestId,
    status:sim.decision,
    riskLevel:"critical",
    summary:"Approval Token Request Policy Simulation: "+sim.decision,
    metadata:{ source:"phase27.1-approval-token-request-policy", simulationId:sim.id, approvalTokenRequestId:sim.approvalTokenRequestId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeApprovalTokenRequestPolicySimulations(sims:ApprovalTokenRequestPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listApprovalTokenRequestPolicySimulations, simulateApprovalTokenRequestPolicy, summarizeApprovalTokenRequestPolicySimulations } from "../../../lib/approval-token-request-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listApprovalTokenRequestPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenRequestPolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Request Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateApprovalTokenRequestPolicy({ approvalTokenRequestId: typeof body.approvalTokenRequestId==="string" ? body.approvalTokenRequestId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Request Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Req={id:string;decision:string;timestamp:string;requestMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;requestMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;approvalTokenRequested:boolean;approvalTokenIssued:boolean;humanApprovalRequired:boolean;humanApproved:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ApprovalTokenRequestPolicyPage(){
 const [requests,setRequests]=useState<Req[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,sRes]=await Promise.all([fetch("/api/human-approval-token-request?limit=100",{cache:"no-store"}),fetch("/api/approval-token-request-policy?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const s=await sRes.json(); if(rRes.ok){ const list=Array.isArray(r.approvalTokenRequests)?r.approvalTokenRequests:[]; setRequests(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Approval Token Request Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/approval-token-request-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({approvalTokenRequestId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approval-token-request-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Approval Token Request Policy</h1><p style={{lineHeight:1.6}}>Phase 27.1 simuliert Policy Checks für Human Approval Token Requests. Token bleibt nicht erteilt. Kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{requests.map((req)=><option key={req.id} value={req.id}>{req.requestMode} · {req.decision} · {req.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Approval Token Request Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.requestMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Requested:</strong> {String(sim.approvalTokenRequested)} · <strong>Token issued:</strong> {String(sim.approvalTokenIssued)} · <strong>Human approved:</strong> {String(sim.humanApproved)} · <strong>Approval required:</strong> {String(sim.humanApprovalRequired)}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approval-token-request-policy"')){ const marker='{ href: "/human-approval-token-request", label: "Approval Token Request", key: "human-approval-token-request" },'; const line='  { href: "/approval-token-request-policy", label: "Approval Token Policy", key: "approval-token-request-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Approval Token Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Approval Token Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase27-1-approval-token-request-policy-audit.md", `# Phase 27.1 – Approval Token Request Policy & Audit

## Ziel
Human Approval Token Requests werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /approval-token-request-policy
- API: /api/approval-token-request-policy
- Store: data/approval-token-request-policy-simulations.jsonl

## Sicherheitsprinzip
- approvalTokenRequested=true
- approvalTokenIssued=false
- humanApproved=false
- humanApprovalRequired=true
- Token wird nicht automatisch erteilt
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- keine Tool- oder Agent-Ausführung
- dryRunOnly=true

## Nächster Schritt
Phase 27.2 kann Approval Token Request Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase27-approval-token-request-policy-audit-runbook.md", `# Runbook – Phase 27.1 Approval Token Request Policy & Audit

## Patch
\`\`\`powershell
npm run phase27:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase27-1-patch-approval-token-request-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase27:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/approval-token-request-policy-store.ts", store);
ensureFile("frontend/app/api/approval-token-request-policy/route.ts", api);
ensureFile("frontend/app/approval-token-request-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 27.1 Patch abgeschlossen.");
