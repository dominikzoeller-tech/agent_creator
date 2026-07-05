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
  pkg.scripts["phase30:0:patch"]="node scripts/phase30-0-patch-token-backed-provider-invocation-preflight.cjs";
  pkg.scripts["phase30:0:verify"]="node scripts/phase30-0-verify-token-backed-provider-invocation-preflight.cjs";
  pkg.scripts["llm:token-backed-provider:verify"]="node scripts/phase30-0-verify-token-backed-provider-invocation-preflight.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 30.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type TokenBackedProviderInvocationPreflightDecision =
  | "token_backed_provider_invocation_preflight_prepared_no_provider_call"
  | "blocked_missing_activation_gate"
  | "blocked_token_not_activation_prepared"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_activation_intent_missing"
  | "blocked_secret_boundary_violation"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface TokenBackedProviderInvocationPreflight {
  id: string;
  timestamp: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: TokenBackedProviderInvocationPreflightDecision;
  preflightMode: "controlled_token_backed_provider_invocation_preflight_no_provider_call";
  preflightChecks: Array<{ name: string; passed: boolean; reason: string }>;
  tokenState: {
    approvalTokenRequested: true;
    approvalTokenIssuancePrepared: true;
    tokenActivationPrepared: true;
    tokenActive: false;
    activationIntentRecorded: boolean;
  };
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
    tokenBackedInvocationAllowed: false;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  tokenBackedPreflightPrepared: true;
  tokenActive: false;
  provider: "none";
  modelSelected: "none";
  promptIncluded: false;
  secretValuesIncluded: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function activationGatePath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function preflightPath(): string { return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPreflight(item: TokenBackedProviderInvocationPreflight): void { ensureStore(); appendFileSync(preflightPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listTokenBackedProviderInvocationPreflights(limit=100): TokenBackedProviderInvocationPreflight[] { ensureStore(); return readJsonl(preflightPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createTokenBackedProviderInvocationPreflight(input:{ activationGateId?: string; metadata?: Record<string, unknown> }): TokenBackedProviderInvocationPreflight {
  ensureStore();
  const gates=readJsonl(activationGatePath());
  const gate=input.activationGateId ? gates.find((entry:any)=>entry.id===input.activationGateId) : gates[0];
  const state=gate?.activationState || {};
  const plan=gate?.providerCallPlan || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"activation_gate_exists", passed:Boolean(gate), reason:gate?"Approval Token Activation Gate gefunden.":"Approval Token Activation Gate fehlt." });
  checks.push({ name:"token_activation_prepared", passed:state.tokenActivationPrepared===true || gate?.tokenActivationPrepared===true, reason:"Token Activation muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:state.tokenActive===false && gate?.tokenActive===false, reason:"Token-backed Provider Preflight darf Token nicht aktiv setzen." });
  checks.push({ name:"activation_intent_recorded", passed:state.activationIntentRecorded===true || gate?.activationIntentRecorded===true, reason:"Activation Intent muss vorhanden sein." });
  checks.push({ name:"provider_selection_blocked", passed:plan.providerSelectionAllowed===false && plan.provider==="none" && plan.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"network_blocked", passed:plan.networkCallAllowed===false && plan.automaticInvocationAllowed===false && gate?.networkCallPerformed===false && gate?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"secret_boundary", passed:gate?.noSecretsIncluded===true && !containsSecretValue(gate), reason:"Keine Secret-Werte im Preflight." });
  checks.push({ name:"prompt_not_included", passed:true, reason:"Prompt wird in Phase 30.0 nicht eingebettet." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed===false && gate?.toolExecutionAllowed===false && gate?.agentExecutionAllowed===false && gate?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:TokenBackedProviderInvocationPreflightDecision="token_backed_provider_invocation_preflight_prepared_no_provider_call";
  let reason="Token-backed Provider Invocation Preflight vorbereitet. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte.";
  if(!gate){ decision="blocked_missing_activation_gate"; reason="Approval Token Activation Gate fehlt."; }
  else if(!(state.tokenActivationPrepared===true || gate.tokenActivationPrepared===true)){ decision="blocked_token_not_activation_prepared"; reason="Token Activation ist nicht vorbereitet."; }
  else if(state.tokenActive!==false || gate.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false. Phase 30.0 ist Preflight-only."; }
  else if(!(state.activationIntentRecorded===true || gate.activationIntentRecorded===true)){ decision="blocked_activation_intent_missing"; reason="Activation Intent fehlt."; }
  else if(gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(plan.providerSelectionAllowed!==false || plan.provider!=="none" || plan.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(plan.networkCallAllowed!==false || plan.automaticInvocationAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:TokenBackedProviderInvocationPreflight={
    id:makeId("token-backed-provider-preflight"), timestamp:new Date().toISOString(), activationGateId:gate?.id || input.activationGateId, issuanceGateId:gate?.issuanceGateId, approvalTokenRequestId:gate?.approvalTokenRequestId, decision, preflightMode:"controlled_token_backed_provider_invocation_preflight_no_provider_call", preflightChecks:checks,
    tokenState:{ approvalTokenRequested:true, approvalTokenIssuancePrepared:true, tokenActivationPrepared:true, tokenActive:false, activationIntentRecorded:state.activationIntentRecorded===true || gate?.activationIntentRecorded===true },
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, tokenBackedInvocationAllowed:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_boundary_violation", reason,
    metadata:{ ...(input.metadata||{}), phase:"30.0", tokenBackedProviderPreflightOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptIncluded:true, noSecretsIncluded:decision!=="blocked_secret_boundary_violation" }
  };
  appendPreflight(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Token-backed Provider Invocation Preflight prepared: "+item.decision, metadata:{ source:"phase30.0-token-backed-provider-preflight", preflightId:item.id, activationGateId:item.activationGateId, tokenActive:false, promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeTokenBackedProviderInvocationPreflights(items:TokenBackedProviderInvocationPreflight[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
`;
const api=String.raw`import { createTokenBackedProviderInvocationPreflight, listTokenBackedProviderInvocationPreflights, summarizeTokenBackedProviderInvocationPreflights } from "../../../lib/token-backed-provider-invocation-preflight-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const tokenBackedProviderInvocationPreflights=listTokenBackedProviderInvocationPreflights(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeTokenBackedProviderInvocationPreflights(tokenBackedProviderInvocationPreflights), tokenBackedProviderInvocationPreflights }); } catch(error){ const message=error instanceof Error ? error.message : "Token-backed Provider Invocation Preflights konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const preflight=createTokenBackedProviderInvocationPreflight({ activationGateId: typeof body.activationGateId==="string" ? body.activationGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, tokenBackedProviderInvocationPreflight:preflight }); } catch(error){ const message=error instanceof Error ? error.message : "Token-backed Provider Invocation Preflight konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ActivationGate={id:string;decision:string;timestamp:string;activationGateMode:string};
type Preflight={id:string;timestamp:string;decision:string;reason:string;preflightMode:string;preflightChecks:Array<{name:string;passed:boolean;reason:string}>;tokenBackedPreflightPrepared:boolean;tokenActive:boolean;provider:string;modelSelected:string;promptIncluded:boolean;secretValuesIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function TokenBackedProviderInvocationPreflightPage(){
 const [gates,setGates]=useState<ActivationGate[]>([]); const [items,setItems]=useState<Preflight[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,pRes]=await Promise.all([fetch("/api/approval-token-activation-gate?limit=100",{cache:"no-store"}),fetch("/api/token-backed-provider-invocation-preflight?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const p=await pRes.json(); if(gRes.ok){ const list=Array.isArray(g.approvalTokenActivationGates)?g.approvalTokenActivationGates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!pRes.ok) throw new Error(p?.error||"Token-backed Preflights konnten nicht geladen werden."); setItems(Array.isArray(p.tokenBackedProviderInvocationPreflights)?p.tokenBackedProviderInvocationPreflights:[]); setSummary(p.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function create(){ const res=await fetch("/api/token-backed-provider-invocation-preflight",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activationGateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Preflight fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="token-backed-provider-invocation-preflight" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fefce8 0%,#f8fafc 100%)",borderColor:"#fde68a"}}><h1 className="section-title">Token-Backed Provider Invocation Preflight</h1><p style={{lineHeight:1.6}}>Phase 30.0 bereitet einen Token-backed Provider Invocation Preflight vor. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Preflight vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((gate)=><option key={gate.id} value={gate.id}>{gate.activationGateMode} · {gate.decision} · {gate.id}</option>)}</select><button className="primary-button" type="button" onClick={create} disabled={!selected}>Token-backed Provider Preflight vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Preflights</h2>{items.length===0?<p>Noch keine Token-backed Preflights.</p>:items.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.preflightMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Preflight:</strong> {String(item.tokenBackedPreflightPrepared)} · <strong>Token active:</strong> {String(item.tokenActive)} · <strong>Provider:</strong> {item.provider} · <strong>Model:</strong> {item.modelSelected}</p><p><strong>Prompt included:</strong> {String(item.promptIncluded)} · <strong>Secrets:</strong> {String(item.secretValuesIncluded)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p><ul>{item.preflightChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "token-backed-provider-invocation-preflight"')){ const line='  { href: "/token-backed-provider-invocation-preflight", label: "Token Provider Preflight", key: "token-backed-provider-invocation-preflight" },'; const marker='{ href: "/approval-token-activation-dashboard", label: "Token Activation Dashboard", key: "approval-token-activation-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Provider Preflight Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Provider Preflight bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase30-0-token-backed-provider-invocation-preflight.md", `# Phase 30.0 – Controlled Token-Backed Provider Invocation Preflight / Still No Provider Call

## Ziel
Ein Token-backed Provider Invocation Preflight wird vorbereitet. Der Token bleibt nicht aktiv, Provider bleibt none, Modell bleibt none, kein Prompt und keine Secret-Werte werden eingebettet.

## UI/API
- UI: /token-backed-provider-invocation-preflight
- API: /api/token-backed-provider-invocation-preflight

## Sicherheitsprinzip
- controlled_token_backed_provider_invocation_preflight_no_provider_call
- tokenBackedPreflightPrepared=true
- tokenActive=false
- provider=none
- modelSelected=none
- promptIncluded=false
- secretValuesIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 30.1 – Token-Backed Provider Preflight Policy & Audit
`);
ensureFile("docs/phase30-token-backed-provider-invocation-preflight-runbook.md", `# Runbook – Phase 30.0 Token-Backed Provider Invocation Preflight

## Patch
\`\`\`powershell
npm run phase30:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase30-0-patch-token-backed-provider-invocation-preflight.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase30:0:verify
npm run build
\`\`\`

## Browser-Test
http://localhost:3000/token-backed-provider-invocation-preflight
`); }
patchPackage();
ensureFile("frontend/lib/token-backed-provider-invocation-preflight-store.ts", store);
ensureFile("frontend/app/api/token-backed-provider-invocation-preflight/route.ts", api);
ensureFile("frontend/app/token-backed-provider-invocation-preflight/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 30.0 Patch abgeschlossen.");
