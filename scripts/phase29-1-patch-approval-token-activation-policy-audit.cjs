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
  pkg.scripts["phase29:1:patch"]="node scripts/phase29-1-patch-approval-token-activation-policy-audit.cjs";
  pkg.scripts["phase29:1:verify"]="node scripts/phase29-1-verify-approval-token-activation-policy-audit.cjs";
  pkg.scripts["llm:approval-token-activation:policy:verify"]="node scripts/phase29-1-verify-approval-token-activation-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 29.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenActivationPolicyDecision =
  | "approval_token_activation_policy_allowed_no_activation"
  | "blocked_missing_activation_gate"
  | "blocked_activation_intent_missing"
  | "blocked_token_already_active"
  | "blocked_auto_activation_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_provider_call_attempt"
  | "blocked_execution_not_safe";

export interface ApprovalTokenActivationPolicySimulation {
  id: string;
  timestamp: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: ApprovalTokenActivationPolicyDecision;
  activationGateMode: "explicit_human_approval_token_activation_gate_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  approvalTokenRequested: true;
  approvalTokenIssuancePrepared: true;
  approvalTokenIssued: boolean;
  tokenActivationPrepared: true;
  tokenActive: false;
  activationIntentRecorded: boolean;
  humanApproved: boolean;
  humanApprovalRequired: true;
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
function activationGatePath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "approval-token-activation-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim: ApprovalTokenActivationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenActivationPolicySimulations(limit=100): ApprovalTokenActivationPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateApprovalTokenActivationPolicy(input:{ activationGateId?: string; metadata?: Record<string, unknown> }): ApprovalTokenActivationPolicySimulation {
  ensureStore();
  const gates=readJsonl(activationGatePath());
  const gate=input.activationGateId ? gates.find((entry:any)=>entry.id===input.activationGateId) : gates[0];
  const state=gate?.activationState || {};
  const plan=gate?.providerCallPlan || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"activation_gate_exists", passed:Boolean(gate), reason:gate?"Approval Token Activation Gate gefunden.":"Approval Token Activation Gate fehlt." });
  checks.push({ name:"activation_gate_mode_no_provider_call", passed:gate?.activationGateMode === "explicit_human_approval_token_activation_gate_no_provider_call", reason:"Activation Gate muss No-Provider-Call bleiben." });
  checks.push({ name:"activation_intent_recorded", passed:state.activationIntentRecorded === true, reason:"Activation Intent muss explizit vorhanden sein." });
  checks.push({ name:"activation_prepared", passed:state.tokenActivationPrepared === true, reason:"Activation muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:state.tokenActive === false, reason:"Policy Simulation darf den Token nicht aktivieren." });
  checks.push({ name:"provider_call_blocked", passed:plan.providerSelectionAllowed === false && plan.provider === "none" && plan.modelSelected === "none" && plan.networkCallAllowed === false && plan.automaticInvocationAllowed === false, reason:"Provider-/Netzwerk-Aufruf bleibt blockiert." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded === true && !containsSecretValue(gate), reason:"Policy darf keine Secret-Werte enthalten." });
  checks.push({ name:"real_llm_blocked", passed:gate?.realLlmCallAllowed === false && gate?.llmCallPerformed === false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallPerformed === false && gate?.providerExecutionAllowed === false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed === false && gate?.toolExecutionAllowed === false && gate?.agentExecutionAllowed === false && gate?.dryRunOnly === true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ApprovalTokenActivationPolicyDecision="approval_token_activation_policy_allowed_no_activation";
  let reason="Approval Token Activation Policy erlaubt nur Simulation. Token bleibt nicht aktiv. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_activation_gate"; reason="Approval Token Activation Gate nicht gefunden."; }
  else if(state.activationIntentRecorded !== true){ decision="blocked_activation_intent_missing"; reason="Explizite Activation Intent fehlt."; }
  else if(state.tokenActive !== false){ decision="blocked_token_already_active"; reason="Token ist bereits aktiv oder Status ist nicht false."; }
  else if(gate.tokenActive !== false){ decision="blocked_auto_activation_attempt"; reason="Auto-Aktivierung erkannt."; }
  else if(gate.noSecretsIncluded !== true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(plan.providerSelectionAllowed !== false || plan.provider !== "none" || plan.modelSelected !== "none" || plan.networkCallAllowed !== false || plan.automaticInvocationAllowed !== false || gate.networkCallPerformed !== false || gate.providerExecutionAllowed !== false){ decision="blocked_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(gate.executionAllowed !== false || gate.toolExecutionAllowed !== false || gate.agentExecutionAllowed !== false || gate.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ApprovalTokenActivationPolicySimulation={
    id:makeId("approval-token-activation-policy-sim"),
    timestamp:new Date().toISOString(),
    activationGateId:gate?.id || input.activationGateId,
    issuanceGateId:gate?.issuanceGateId,
    approvalTokenRequestId:gate?.approvalTokenRequestId,
    decision,
    activationGateMode:"explicit_human_approval_token_activation_gate_no_provider_call",
    policyChecks:checks,
    approvalTokenRequested:true,
    approvalTokenIssuancePrepared:true,
    approvalTokenIssued:state.approvalTokenIssued === true,
    tokenActivationPrepared:true,
    tokenActive:false,
    activationIntentRecorded:state.activationIntentRecorded === true,
    humanApproved:state.humanApproved === true,
    humanApprovalRequired:true,
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
    metadata:{ ...(input.metadata||{}), phase:"29.1", approvalTokenActivationPolicyOnly:true, tokenActive:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true },
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.activationGateId, status:sim.decision, riskLevel:"critical", summary:"Approval Token Activation Policy Simulation: "+sim.decision, metadata:{ source:"phase29.1-approval-token-activation-policy", simulationId:sim.id, activationGateId:sim.activationGateId, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeApprovalTokenActivationPolicySimulations(sims:ApprovalTokenActivationPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listApprovalTokenActivationPolicySimulations, simulateApprovalTokenActivationPolicy, summarizeApprovalTokenActivationPolicySimulations } from "../../../lib/approval-token-activation-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listApprovalTokenActivationPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenActivationPolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Approval Token Activation Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateApprovalTokenActivationPolicy({ activationGateId: typeof body.activationGateId==="string" ? body.activationGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Approval Token Activation Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;activationGateMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;activationGateMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;tokenActivationPrepared:boolean;tokenActive:boolean;activationIntentRecorded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ApprovalTokenActivationPolicyPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,sRes]=await Promise.all([fetch("/api/approval-token-activation-gate?limit=100",{cache:"no-store"}),fetch("/api/approval-token-activation-policy?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const s=await sRes.json(); if(gRes.ok){ const list=Array.isArray(g.approvalTokenActivationGates)?g.approvalTokenActivationGates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Activation Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/approval-token-activation-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activationGateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="approval-token-activation-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Approval Token Activation Policy</h1><p style={{lineHeight:1.6}}>Phase 29.1 simuliert Policy Checks für Approval Token Activation Gates. Token bleibt nicht aktiv. Kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.activationGateMode} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Approval Token Activation Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0 ? <p>Noch keine Policy Simulations.</p> : sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.activationGateMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Activation prepared:</strong> {String(sim.tokenActivationPrepared)} · <strong>Token active:</strong> {String(sim.tokenActive)} · <strong>Activation intent:</strong> {String(sim.activationIntentRecorded)}</p><p><strong>No secrets:</strong> {String(sim.noSecretsIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "approval-token-activation-policy"')){ const line='  { href: "/approval-token-activation-policy", label: "Token Activation Policy", key: "approval-token-activation-policy" },'; const marker='{ href: "/approval-token-activation-gate", label: "Token Activation Gate", key: "approval-token-activation-gate" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Activation Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Activation Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase29-1-approval-token-activation-policy-audit.md", `# Phase 29.1 – Approval Token Activation Policy & Audit

## Ziel
Approval Token Activation Gates werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## UI/API
- UI: /approval-token-activation-policy
- API: /api/approval-token-activation-policy

## Sicherheitsprinzip
- explicit_human_approval_token_activation_gate_no_provider_call
- tokenActivationPrepared=true
- tokenActive=false
- activationIntentRecorded=true
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 29.2 – Approval Token Activation Dashboard & Smoke
`);
ensureFile("docs/phase29-approval-token-activation-policy-audit-runbook.md", `# Runbook – Phase 29.1 Approval Token Activation Policy & Audit

## Patch
\`\`\`powershell
npm run phase29:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase29-1-patch-approval-token-activation-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase29:1:verify
npm run build
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/approval-token-activation-policy-store.ts", store);
ensureFile("frontend/app/api/approval-token-activation-policy/route.ts", api);
ensureFile("frontend/app/approval-token-activation-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 29.1 Patch abgeschlossen.");
