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
  pkg.scripts["phase26:0:patch"]="node scripts/phase26-0-patch-controlled-real-provider-invocation-gate.cjs";
  pkg.scripts["phase26:0:verify"]="node scripts/phase26-0-verify-controlled-real-provider-invocation-gate.cjs";
  pkg.scripts["llm:real-provider-gate:verify"]="node scripts/phase26-0-verify-controlled-real-provider-invocation-gate.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 26.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledRealProviderInvocationGateDecision =
  | "real_provider_invocation_gate_prepared_human_approval_required"
  | "blocked_missing_simulation_envelope"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_operational_controls_violation";

export interface ControlledRealProviderInvocationGate {
  id: string;
  timestamp: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledRealProviderInvocationGateDecision;
  gateMode: "controlled_real_provider_invocation_gate_human_approval_required";
  approvalState: {
    humanApprovalRequired: true;
    humanApproved: false;
    approvalTokenIssued: false;
    approvalTokenId?: string;
  };
  gateChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
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
function simulationEnvelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function gatePath(): string { return path.join(dataDir(), "controlled-real-provider-invocation-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate: ControlledRealProviderInvocationGate): void { ensureStore(); appendFileSync(gatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledRealProviderInvocationGates(limit=100): ControlledRealProviderInvocationGate[] { ensureStore(); return readJsonl(gatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledRealProviderInvocationGate(input:{ simulationEnvelopeId?: string; metadata?: Record<string, unknown> }): ControlledRealProviderInvocationGate {
  ensureStore();
  const envelopes=readJsonl(simulationEnvelopePath());
  const envelope=input.simulationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.simulationEnvelopeId) : envelopes[0];
  const request=envelope?.simulatedProviderRequest || {};
  const output=envelope?.outputContract || {};
  const defaults=envelope?.operationalMetadata || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"simulation_envelope_exists", passed:Boolean(envelope), reason: envelope ? "Simulation Envelope gefunden." : "Simulation Envelope fehlt." });
  checks.push({ name:"simulation_no_external_call", passed:envelope?.simulationMode === "controlled_provider_invocation_simulation_envelope_no_external_call", reason:"Simulation Envelope muss no-external-call bleiben." });
  checks.push({ name:"human_approval_required", passed:true, reason:"Human Approval ist vor jedem echten externen Provider Call zwingend." });
  checks.push({ name:"human_not_approved_yet", passed:true, reason:"Dieses Gate erteilt noch keine Approval und gibt keinen Approval Token aus." });
  checks.push({ name:"provider_selection_blocked", passed:request.provider === "none" && request.modelSelected === "none", reason:"Provider und Modell bleiben im Gate blockiert." });
  checks.push({ name:"automatic_invocation_blocked", passed:request.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false, reason:"Automatischer Provider-/Netzwerk-Aufruf ist blockiert." });
  checks.push({ name:"secret_boundary", passed:envelope?.noSecretsIncluded === true && request.promptIncluded === false && request.secretValuesIncluded === false && !containsSecretValue(envelope), reason:"Keine Prompt- oder Secret-Werte dürfen in Gate-Daten enthalten sein." });
  checks.push({ name:"real_llm_blocked_without_approval", passed:envelope?.realLlmCallAllowed === false && envelope?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:envelope?.dryRunOnly === true, reason:envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss nicht-ausführend bleiben." });
  checks.push({ name:"operational_controls_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  let decision:ControlledRealProviderInvocationGateDecision="real_provider_invocation_gate_prepared_human_approval_required";
  let reason="Controlled Real Provider Invocation Gate vorbereitet. Echte Provider Invocation benötigt explizite Human Approval. Kein automatischer Provider-/Netzwerk-Aufruf.";
  if(!envelope){ decision="blocked_missing_simulation_envelope"; reason="Simulation Envelope nicht gefunden."; }
  else if(request.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || request.provider !== "none" || request.modelSelected !== "none"){ decision="blocked_auto_provider_call_attempt"; reason="Automatischer Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(envelope.noSecretsIncluded !== true || request.promptIncluded !== false || request.secretValuesIncluded !== false || containsSecretValue(envelope)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(envelope.realLlmCallAllowed !== false || envelope.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne explizite Approval nicht blockiert."; }
  else if(envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const gate:ControlledRealProviderInvocationGate={
    id:makeId("real-provider-gate"),
    timestamp:new Date().toISOString(),
    simulationEnvelopeId:envelope?.id || input.simulationEnvelopeId,
    preflightId:envelope?.preflightId,
    boundaryCheckId:envelope?.boundaryCheckId,
    adapterStubId:envelope?.adapterStubId,
    invocationEnvelopeId:envelope?.invocationEnvelopeId,
    decision,
    gateMode:"controlled_real_provider_invocation_gate_human_approval_required",
    approvalState:{ humanApprovalRequired:true, humanApproved:false, approvalTokenIssued:false },
    gateChecks:checks,
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, manualApprovalRequiredBeforeAnyExternalCall:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
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
    metadata:{ ...(input.metadata||{}), phase:"26.0", humanApprovalRequired:true, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, gateOnly:true },
  };
  appendGate(gate);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:gate.id,
    status:gate.decision,
    riskLevel:"critical",
    summary:"Controlled Real Provider Invocation Gate: "+gate.decision,
    metadata:{ source:"phase26.0-controlled-real-provider-invocation-gate", gateId:gate.id, simulationEnvelopeId:gate.simulationEnvelopeId, humanApprovalRequired:true, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return gate;
}
export function summarizeControlledRealProviderInvocationGates(gates:ControlledRealProviderInvocationGate[]){ const byDecision:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; } return { total:gates.length, byDecision }; }
`;
const api=String.raw`import { createControlledRealProviderInvocationGate, listControlledRealProviderInvocationGates, summarizeControlledRealProviderInvocationGates } from "../../../lib/controlled-real-provider-invocation-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const gates=listControlledRealProviderInvocationGates(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeControlledRealProviderInvocationGates(gates), gates }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Invocation Gates konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const gate=createControlledRealProviderInvocationGate({ simulationEnvelopeId: typeof body.simulationEnvelopeId==="string" ? body.simulationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, gate }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Invocation Gate konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;timestamp:string;simulationMode:string};
type Gate={id:string;timestamp:string;decision:string;reason:string;gateMode:string;approvalState:any;providerCallPlan:any;operationalControls:any;gateChecks:Array<{name:string;passed:boolean;reason:string}>;networkCallPerformed:boolean;providerExecutionAllowed:boolean;realLlmCallAllowed:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ControlledRealProviderInvocationGatePage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [gates,setGates]=useState<Gate[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,gRes]=await Promise.all([fetch("/api/controlled-provider-invocation-simulation-envelope?limit=100",{cache:"no-store"}),fetch("/api/controlled-real-provider-invocation-gate?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const g=await gRes.json(); if(eRes.ok){ const list=Array.isArray(e.simulationEnvelopes)?e.simulationEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!gRes.ok) throw new Error(g?.error||"Gates konnten nicht geladen werden."); setGates(Array.isArray(g.gates)?g.gates:[]); setSummary(g.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createGate(){ const res=await fetch("/api/controlled-real-provider-invocation-gate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({simulationEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Gate fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="controlled-real-provider-invocation-gate" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff1f2 0%,#f8fafc 100%)",borderColor:"#fda4af"}}><h1 className="section-title">Controlled Real Provider Invocation Gate</h1><p style={{lineHeight:1.6}}>Phase 26.0 bereitet ein Gate für echte Provider Invocation vor. Kein automatischer Netzwerk-/Provider-Aufruf. Explizite Human Approval ist zwingend.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Gate vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.simulationMode} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={createGate} disabled={!selected}>Controlled Real Provider Invocation Gate vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Gates</h2>{gates.length===0 ? <p>Noch keine Gates.</p> : gates.map((gate)=><article key={gate.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{gate.gateMode}</strong> <span className="chip">{gate.decision}</span></div><div className="helper-text"><code>{gate.id}</code> · {gate.timestamp}</div><p><strong>Reason:</strong> {gate.reason}</p><p><strong>No secrets:</strong> {String(gate.noSecretsIncluded)} · <strong>Network call:</strong> {String(gate.networkCallPerformed)} · <strong>Provider execution:</strong> {String(gate.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(gate.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(gate.llmCallPerformed)} · <strong>Execution:</strong> {String(gate.executionAllowed)} · <strong>Tool:</strong> {String(gate.toolExecutionAllowed)} · <strong>Agent:</strong> {String(gate.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(gate.dryRunOnly)}</p><h3>Approval State</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gate.approvalState ?? {}, null, 2)}</pre><h3>Provider Call Plan</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gate.providerCallPlan ?? {}, null, 2)}</pre><h3>Operational Controls</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gate.operationalControls ?? {}, null, 2)}</pre><ul>{gate.gateChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "controlled-real-provider-invocation-gate"')){ const line='  { href: "/controlled-real-provider-invocation-gate", label: "Real Provider Gate", key: "controlled-real-provider-invocation-gate" },'; const markers=['{ href: "/provider-simulation-dashboard", label: "Simulation Dashboard", key: "provider-simulation-dashboard" },','{ href: "/controlled-provider-invocation-simulation-policy", label: "Simulation Policy", key: "controlled-provider-invocation-simulation-policy" },']; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real Provider Gate Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real Provider Gate bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase26-0-controlled-real-provider-invocation-gate.md", `# Phase 26.0 – Controlled Real Provider Invocation Gate / Explicit Human Approval Required

## Ziel
Ein Gate für echte Provider Invocation wird vorbereitet. Es findet kein automatischer Netzwerk-/Provider-Aufruf statt. Human Approval ist zwingend.

## Neue UI/API
- UI: /controlled-real-provider-invocation-gate
- API: /api/controlled-real-provider-invocation-gate
- Store: data/controlled-real-provider-invocation-gates.jsonl

## Sicherheitsprinzip
- controlled_real_provider_invocation_gate_human_approval_required
- echter externer Call nur nach expliziter Human Approval
- humanApprovalRequired=true
- humanApproved=false
- approvalTokenIssued=false
- providerSelectionAllowed=false
- provider=none
- modelSelected=none
- automaticInvocationAllowed=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- keine Tool-Ausführung
- keine Agent-Ausführung
- dryRunOnly=true

## Nächster Schritt
Phase 26.1 kann Real Provider Gate Policy & Audit ergänzen.
`);
ensureFile("docs/phase26-controlled-real-provider-invocation-gate-runbook.md", `# Runbook – Phase 26.0 Controlled Real Provider Invocation Gate

## Patch
\`\`\`powershell
npm run phase26:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase26-0-patch-controlled-real-provider-invocation-gate.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase26:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-real-provider-invocation-gate-store.ts", store);
ensureFile("frontend/app/api/controlled-real-provider-invocation-gate/route.ts", api);
ensureFile("frontend/app/controlled-real-provider-invocation-gate/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 26.0 Patch abgeschlossen.");
