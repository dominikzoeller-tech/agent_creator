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
  pkg.scripts["phase26:1:patch"]="node scripts/phase26-1-patch-real-provider-gate-policy-audit.cjs";
  pkg.scripts["phase26:1:verify"]="node scripts/phase26-1-verify-real-provider-gate-policy-audit.cjs";
  pkg.scripts["llm:real-provider-gate:policy:verify"]="node scripts/phase26-1-verify-real-provider-gate-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 26.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RealProviderGatePolicyDecision =
  | "gate_policy_simulation_allowed_human_approval_required"
  | "blocked_missing_real_provider_gate"
  | "blocked_human_approval_not_required"
  | "blocked_human_approval_already_granted"
  | "blocked_approval_token_issued"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_operational_controls_violation";

export interface RealProviderGatePolicySimulation {
  id: string;
  timestamp: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: RealProviderGatePolicyDecision;
  gateMode: "controlled_real_provider_invocation_gate_human_approval_required";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  humanApprovalRequired: true;
  humanApproved: false;
  approvalTokenIssued: false;
  providerSelectionAllowed: false;
  provider: "none";
  modelSelected: "none";
  automaticInvocationAllowed: false;
  networkCallAllowed: false;
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
function gatePath(): string { return path.join(dataDir(), "controlled-real-provider-invocation-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "controlled-real-provider-gate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: RealProviderGatePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listRealProviderGatePolicySimulations(limit=100): RealProviderGatePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateRealProviderGatePolicy(input:{ gateId?: string; metadata?: Record<string, unknown> }): RealProviderGatePolicySimulation {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.gateId ? gates.find((entry:any)=>entry.id===input.gateId) : gates[0];
  const approval=gate?.approvalState || {};
  const plan=gate?.providerCallPlan || {};
  const output=gate?.outputContract || {};
  const controls=gate?.operationalControls || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"real_provider_gate_exists", passed:Boolean(gate), reason: gate ? "Real Provider Gate gefunden." : "Real Provider Gate fehlt." });
  checks.push({ name:"gate_mode_human_approval_required", passed:gate?.gateMode === "controlled_real_provider_invocation_gate_human_approval_required", reason:"Gate Mode muss Human Approval erzwingen." });
  checks.push({ name:"human_approval_required", passed:approval.humanApprovalRequired === true, reason:"Human Approval muss zwingend erforderlich sein." });
  checks.push({ name:"human_not_approved", passed:approval.humanApproved === false, reason:"Gate Policy darf noch keine Human Approval enthalten." });
  checks.push({ name:"approval_token_not_issued", passed:approval.approvalTokenIssued === false, reason:"Gate Policy darf noch keinen Approval Token ausstellen." });
  checks.push({ name:"provider_call_plan_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false && plan.manualApprovalRequiredBeforeAnyExternalCall === true, reason:"Provider Call Plan muss externen Call blockieren." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Gate darf keine Secret-ähnlichen Werte enthalten." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallPerformed === false && gate?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:gate?.dryRunOnly === true, reason: gate?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss nicht-ausführend bleiben." });
  checks.push({ name:"operational_controls_metadata_only", passed:controls.timeoutMs === 30000 && controls.maxRetries === 0 && controls.rateLimitPolicy === "not_configured_metadata_only" && controls.costLimitPolicy === "not_configured_metadata_only" && controls.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls müssen Metadata-only bleiben." });
  let decision:RealProviderGatePolicyDecision="gate_policy_simulation_allowed_human_approval_required";
  let reason="Real Provider Gate Policy Simulation erlaubt nur Gate/Human-Approval-required Zustand. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_real_provider_gate"; reason="Real Provider Gate nicht gefunden."; }
  else if(approval.humanApprovalRequired !== true){ decision="blocked_human_approval_not_required"; reason="Human Approval ist nicht zwingend erforderlich."; }
  else if(approval.humanApproved !== false){ decision="blocked_human_approval_already_granted"; reason="Gate enthält bereits Human Approval."; }
  else if(approval.approvalTokenIssued !== false){ decision="blocked_approval_token_issued"; reason="Approval Token wurde bereits ausgestellt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_auto_provider_call_attempt"; reason="Provider-Auswahl oder externer Call ist nicht eindeutig blockiert."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(gate.realLlmCallAllowed !== false || gate.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne Approval nicht blockiert."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const sim:RealProviderGatePolicySimulation={
    id:makeId("real-provider-gate-policy-sim"),
    timestamp:new Date().toISOString(),
    gateId:gate?.id || input.gateId,
    simulationEnvelopeId:gate?.simulationEnvelopeId,
    preflightId:gate?.preflightId,
    boundaryCheckId:gate?.boundaryCheckId,
    adapterStubId:gate?.adapterStubId,
    invocationEnvelopeId:gate?.invocationEnvelopeId,
    decision,
    gateMode:"controlled_real_provider_invocation_gate_human_approval_required",
    policyChecks:checks,
    humanApprovalRequired:true,
    humanApproved:false,
    approvalTokenIssued:false,
    providerSelectionAllowed:false,
    provider:"none",
    modelSelected:"none",
    automaticInvocationAllowed:false,
    networkCallAllowed:false,
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
    metadata:{ ...(input.metadata||{}), phase:"26.1", humanApprovalRequired:true, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, gatePolicyOnly:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:sim.gateId,
    status:sim.decision,
    riskLevel:"critical",
    summary:"Real Provider Gate Policy Simulation: "+sim.decision,
    metadata:{ source:"phase26.1-real-provider-gate-policy", simulationId:sim.id, gateId:sim.gateId, humanApprovalRequired:true, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return sim;
}
export function summarizeRealProviderGatePolicySimulations(sims:RealProviderGatePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listRealProviderGatePolicySimulations, simulateRealProviderGatePolicy, summarizeRealProviderGatePolicySimulations } from "../../../lib/real-provider-gate-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listRealProviderGatePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeRealProviderGatePolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Gate Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateRealProviderGatePolicy({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Gate Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;gateMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;gateMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;humanApprovalRequired:boolean;humanApproved:boolean;approvalTokenIssued:boolean;providerSelectionAllowed:boolean;provider:string;modelSelected:string;automaticInvocationAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function RealProviderGatePolicyPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,sRes]=await Promise.all([fetch("/api/controlled-real-provider-invocation-gate?limit=100",{cache:"no-store"}),fetch("/api/real-provider-gate-policy?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const s=await sRes.json(); if(gRes.ok){ const list=Array.isArray(g.gates)?g.gates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Gate Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/real-provider-gate-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="real-provider-gate-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Real Provider Gate Policy</h1><p style={{lineHeight:1.6}}>Phase 26.1 simuliert Policy Checks für Controlled Real Provider Invocation Gates. Human Approval bleibt zwingend. Kein automatischer Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.gateMode} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Real Provider Gate Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.gateMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Approval required:</strong> {String(sim.humanApprovalRequired)} · <strong>Approved:</strong> {String(sim.humanApproved)} · <strong>Approval token:</strong> {String(sim.approvalTokenIssued)}</p><p><strong>Provider:</strong> {sim.provider} · <strong>Model:</strong> {sim.modelSelected} · <strong>Auto invoke:</strong> {String(sim.automaticInvocationAllowed)} · <strong>Network allowed:</strong> {String(sim.networkCallAllowed)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(sim.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "real-provider-gate-policy"')){ const marker='{ href: "/controlled-real-provider-invocation-gate", label: "Real Provider Gate", key: "controlled-real-provider-invocation-gate" },'; const line='  { href: "/real-provider-gate-policy", label: "Real Gate Policy", key: "real-provider-gate-policy" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real Gate Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real Gate Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase26-1-real-provider-gate-policy-audit.md", `# Phase 26.1 – Real Provider Gate Policy & Audit

## Ziel
Controlled Real Provider Invocation Gates werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Neue UI/API
- UI: /real-provider-gate-policy
- API: /api/real-provider-gate-policy
- Store: data/controlled-real-provider-gate-policy-simulations.jsonl

## Sicherheitsprinzip
- Human Approval zwingend
- humanApprovalRequired=true
- humanApproved=false
- approvalTokenIssued=false
- kein automatischer Provider-/Netzwerk-Aufruf
- providerSelectionAllowed=false
- provider=none
- modelSelected=none
- automaticInvocationAllowed=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- keine Tool- oder Agent-Ausführung
- dryRunOnly=true

## Nächster Schritt
Phase 26.2 kann Real Provider Gate Dashboard & Smoke ergänzen.
`);
ensureFile("docs/phase26-real-provider-gate-policy-audit-runbook.md", `# Runbook – Phase 26.1 Real Provider Gate Policy & Audit

## Patch
\`\`\`powershell
npm run phase26:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase26-1-patch-real-provider-gate-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase26:1:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/real-provider-gate-policy-store.ts", store);
ensureFile("frontend/app/api/real-provider-gate-policy/route.ts", api);
ensureFile("frontend/app/real-provider-gate-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 26.1 Patch abgeschlossen.");
