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
  pkg.scripts["phase28:1:patch"]="node scripts/phase28-1-patch-approval-token-issuance-policy-audit.cjs";
  pkg.scripts["phase28:1:verify"]="node scripts/phase28-1-verify-approval-token-issuance-policy-audit.cjs";
  pkg.scripts["llm:approval-token-issuance:policy:verify"]="node scripts/phase28-1-verify-approval-token-issuance-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 28.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenIssuancePolicyDecision =
  | "approval_token_issuance_policy_allowed_no_token_issued"
  | "blocked_missing_issuance_gate"
  | "blocked_issuance_intent_missing"
  | "blocked_token_not_prepared"
  | "blocked_token_already_issued"
  | "blocked_human_already_approved"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_token"
  | "blocked_execution_not_safe"
  | "blocked_operational_controls_violation";

export interface ApprovalTokenIssuancePolicySimulation {
  id: string;
  timestamp: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenIssuancePolicyDecision;
  issuanceGateMode: "explicit_human_approval_token_issuance_gate_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssuancePrepared: true;
  approvalTokenIssued: false;
  humanApproved: false;
  humanApprovalRequired: true;
  issuanceIntentRecorded: boolean;
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
function issuanceGatePath(): string { return path.join(dataDir(), "approval-token-issuance-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-issuance-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenIssuancePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenIssuancePolicySimulations(limit=100): ApprovalTokenIssuancePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenIssuancePolicy(input:{ issuanceGateId?: string; metadata?: Record<string, unknown> }): ApprovalTokenIssuancePolicySimulation {
  ensureStore();
  const gates=readJsonl(issuanceGatePath());
  const gate=input.issuanceGateId ? gates.find((entry:any)=>entry.id===input.issuanceGateId) : gates[0];
  const state=gate?.issuanceState || {};
  const plan=gate?.providerCallPlan || {};
  const controls=gate?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"issuance_gate_exists", passed:Boolean(gate), reason: gate ? "Approval Token Issuance Gate gefunden." : "Approval Token Issuance Gate fehlt." });
  checks.push({ name:"issuance_gate_mode_no_provider_call", passed:gate?.issuanceGateMode === "explicit_human_approval_token_issuance_gate_no_provider_call", reason:"Issuance Gate muss no-provider-call bleiben." });
  checks.push({ name:"approval_token_requested", passed:state.approvalTokenRequested === true, reason:"Approval Token muss requested sein." });
  checks.push({ name:"issuance_prepared", passed:state.approvalTokenIssuancePrepared === true, reason:"Token Issuance muss vorbereitet sein." });
  checks.push({ name:"issuance_intent_recorded", passed:state.issuanceIntentRecorded === true, reason:"Explizite Issuance Intent muss vorhanden sein." });
  checks.push({ name:"token_not_issued", passed:state.approvalTokenIssued === false, reason:"Policy Simulation darf Token nicht ausstellen." });
  checks.push({ name:"human_not_approved", passed:state.humanApproved === false, reason:"Policy Simulation darf Human Approval nicht erteilen." });
  checks.push({ name:"human_approval_required", passed:state.humanApprovalRequired === true, reason:"Human Approval bleibt erforderlich." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Issuance Policy darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls müssen Metadata-only bleiben." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Token blockiert." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallPerformed === false && gate?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:gate?.dryRunOnly === true, reason:gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  let decision:ApprovalTokenIssuancePolicyDecision="approval_token_issuance_policy_allowed_no_token_issued";
  let reason="Approval Token Issuance Policy erlaubt nur kontrollierte Policy Simulation. Token bleibt nicht ausgestellt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_issuance_gate"; reason="Approval Token Issuance Gate nicht gefunden."; }
  else if(state.issuanceIntentRecorded !== true){ decision="blocked_issuance_intent_missing"; reason="Explizite Issuance Intent fehlt."; }
  else if(state.approvalTokenIssuancePrepared !== true){ decision="blocked_token_not_prepared"; reason="Approval Token Issuance ist nicht vorbereitet."; }
  else if(state.approvalTokenIssued !== false){ decision="blocked_token_already_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(state.humanApproved !== false){ decision="blocked_human_already_approved"; reason="Human Approval ist bereits erteilt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_token"; reason="Real LLM Call ist ohne Token nicht blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const sim:ApprovalTokenIssuancePolicySimulation={
    id:makeId("approval-token-issuance-policy-sim"),
    timestamp:new Date().toISOString(),
    issuanceGateId:gate?.id || input.issuanceGateId,
    approvalTokenRequestId:gate?.approvalTokenRequestId,
    gateId:gate?.gateId,
    simulationEnvelopeId:gate?.simulationEnvelopeId,
    preflightId:gate?.preflightId,
    boundaryCheckId:gate?.boundaryCheckId,
    adapterStubId:gate?.adapterStubId,
    invocationEnvelopeId:gate?.invocationEnvelopeId,
    decision,
    issuanceGateMode:"explicit_human_approval_token_issuance_gate_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssuancePrepared:true,
    approvalTokenIssued:false,
    humanApproved:false,
    humanApprovalRequired:true,
    issuanceIntentRecorded:state.issuanceIntentRecorded === true,
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
    metadata:{ ...(input.metadata||{}), phase:"28.1", approvalTokenIssuancePolicyOnly:true, approvalTokenIssued:false, humanApproved:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.issuanceGateId,
    status:sim.decision,
    riskLevel:"critical",
    summary:"Approval Token Issuance Policy Simulation: "+sim.decision,
    metadata:{ source:"phase28.1-approval-token-issuance-policy", simulationId:sim.id, issuanceGateId:sim.issuanceGateId, approvalTokenIssued:false, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeApprovalTokenIssuancePolicySimulations(sims:ApprovalTokenIssuancePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listApprovalTokenIssuancePolicySimulations, simulateApprovalTokenIssuancePolicy, summarizeApprovalTokenIssuancePolicySimulations } from "../../../lib/approval-token-issuance-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listApprovalTokenIssuancePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenIssuancePolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateApprovalTokenIssuancePolicy({ issuanceGateId: typeof body.issuanceGateId==="string" ? body.issuanceGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;issuanceGateMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;issuanceGateMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;approvalTokenRequested:boolean;approvalTokenIssuancePrepared:boolean;approvalTokenIssued:boolean;humanApproved:boolean;humanApprovalRequired:boolean;issuanceIntentRecorded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ApprovalTokenIssuancePolicyPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,sRes]=await Promise.all([fetch("/api/approval-token-issuance-gate?limit=100",{cache:"no-store"}),fetch("/api/approval-token-issuance-policy?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const s=await sRes.json(); if(gRes.ok){ const list=Array.isArray(g.approvalTokenIssuanceGates)?g.approvalTokenIssuanceGates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Issuance Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/approval-token-issuance-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issuanceGateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approval-token-issuance-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Approval Token Issuance Policy</h1><p style={{lineHeight:1.6}}>Phase 28.1 simuliert Policy Checks für Approval Token Issuance Gates. Token bleibt nicht ausgestellt. Kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.issuanceGateMode} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Approval Token Issuance Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.issuanceGateMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.approvalTokenIssuancePrepared)} · <strong>Token issued:</strong> {String(sim.approvalTokenIssued)} · <strong>Human approved:</strong> {String(sim.humanApproved)} · <strong>Intent:</strong> {String(sim.issuanceIntentRecorded)}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approval-token-issuance-policy"')){ const marker='{ href: "/approval-token-issuance-gate", label: "Token Issuance Gate", key: "approval-token-issuance-gate" },'; const line='  { href: "/approval-token-issuance-policy", label: "Token Issuance Policy", key: "approval-token-issuance-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Issuance Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Issuance Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase28-1-approval-token-issuance-policy-audit.md", `# Phase 28.1 – Approval Token Issuance Policy & Audit

## Ziel
Approval Token Issuance Gates werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /approval-token-issuance-policy
- API: /api/approval-token-issuance-policy
- Store: data/approval-token-issuance-policy-simulations.jsonl

## Sicherheitsprinzip
- approvalTokenIssuancePrepared=true
- approvalTokenIssued=false
- humanApproved=false
- issuanceIntentRecorded=true
- Token wird nicht in Policy Simulation ausgestellt
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- keine Tool- oder Agent-Ausführung
- dryRunOnly=true

## Nächster Schritt
Phase 28.2 kann Approval Token Issuance Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase28-approval-token-issuance-policy-audit-runbook.md", `# Runbook – Phase 28.1 Approval Token Issuance Policy & Audit

## Patch
\`\`\`powershell
npm run phase28:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase28-1-patch-approval-token-issuance-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase28:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/approval-token-issuance-policy-store.ts", store);
ensureFile("frontend/app/api/approval-token-issuance-policy/route.ts", api);
ensureFile("frontend/app/approval-token-issuance-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 28.1 Patch abgeschlossen.");
